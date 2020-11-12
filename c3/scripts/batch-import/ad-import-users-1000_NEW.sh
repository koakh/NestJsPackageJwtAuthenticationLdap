#!/bin/bash

exec &> $0.log

if [[ ! -f $1 ]]; then
  echo import file missing
  exit 1
fi
max_users_add=`[[ $2 ]] && echo $2 || echo 1000`
skip=y
users=()
declare -A members
total_time=(0 0)
it=1

function reset_members
{
  members=(\
    [C3Administrator]='dn: cn=c3administrator,ou=groups,dc=c3edu,dc=online
changetype: modify
'
    [C3Student]='dn: cn=c3student,ou=groups,dc=c3edu,dc=online
changetype: modify
'
    [C3Teacher]='dn: cn=c3teacher,ou=groups,dc=c3edu,dc=online
changetype: modify
'
    [C3Parent]='dn: cn=c3parent,ou=groups,dc=c3edu,dc=online
changetype: modify
'
  )
}

function convert_time
{
  local time=$1
  local units=(ns us ms s m h d)
  local limits=(1000 1000 1000 60 60 24)
  local i=0

  while [ $i -lt 6 ]; do
    if [ `echo "$time<${limits[i]}" | bc -l` -eq 1 ]; then break; fi
    time=`echo $time/${limits[i]} | bc -l`
    i=$((i+1))
  done

  echo $time ${units[i]}
}

function ins_users
{
  ldbadd -H /var/lib/samba/private/sam.ldb <<EOF
${users[*]}
EOF
}

function ins_members
{
  ldbmodify -H /var/lib/samba/private/sam.ldb <<EOF
${members[*]}
EOF
}

function ins
{
  local time=()
  local conv_time=()
  local conv_total_time=()
  local start

  start=`date +%s%N`
  ins_users
  time[0]=$((`date +%s%N`-start))

  start=`date +%s%N`
  ins_members
  time[1]=$((`date +%s%N`-start))

  for i in 0 1; do
    total_time[i]=$((${total_time[i]}+${time[i]}))
    conv_time[i]=`convert_time ${time[i]}`
    conv_total_time[i]=`convert_time ${total_time[i]}`
  done

  echo "Time ($it): <`convert_time $((${time[0]}+${time[1]}))`/`convert_time $((${total_time[0]}+${total_time[1]}))`> <${conv_time[0]}/${conv_total_time[0]}> <${conv_time[1]}/${conv_total_time[1]}>"

  it=$((it+1))
  users=()
  reset_members
}

reset_members
until [[ $stop ]]; do
  read line || break

  if [[ $skip = y ]]; then
    skip=n
    continue
  fi

  IFS=,
  fields=($line)

  i=4
  for f in "${fields[@]:0:i}"; do
    if [[ ! $f ]]; then
      echo fields cn, role, password and givenName are mandatory
      exit 1
    fi
  done

  case ${fields[1]} in
    10) group=C3Student;;
    15) group=C3Parent;;
    20) group=C3Teacher;;
    99) group=C3Administrator;;
    *) echo import role unknown!!!; exit 1;;
  esac
  pwd=`echo -n "\"${fields[2]}\"" | iconv -f UTF-8 -t UTF-16LE | base64`
  displayname="${fields[3]}`[[ ${fields[4]} ]] && echo ' '`${fields[4]}"
  dn=cn=${fields[0]},ou=$group,ou=People,dc=c3edu,dc=online

  IFS=$'\n'
  opt=()
  for a in sn dateOfBirth mail gender telephoneNumber studentID; do
    if [[ ${fields[i]} ]]; then
      opt+=("$a: ${fields[i]}")
    fi
  i=$((i+1))
  done

users+=("dn: $dn
sAMAccountName: ${fields[0]}
C3UserRole: ${fields[1]}
unicodePwd:: $pwd
givenName: ${fields[3]}
displayName: $displayname
userAccountControl: 66056
objectClass: User
${opt[*]}
")

members[$group]+="add: member
member: $dn
"

if [ ${#users[@]} -eq $max_users_add ]; then ins; fi

done < $1

if [ ${#users[@]} -gt 0 ]; then ins; fi

echo "
Times:
  users: `convert_time ${total_time[0]}`
  members: `convert_time ${total_time[1]}`
  total: `convert_time $((${total_time[0]}+${total_time[1]}))`
"

exit 0
