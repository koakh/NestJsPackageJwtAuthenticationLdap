#!/bin/bash

if [[ ! -f $1 ]]; then
  echo import file missing
  exit 1
fi

skip=y
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

  IFS=$'\n'
  opt=()
  for a in sn dateOfBirth mail gender telephoneNumber studentID; do
    if [[ ${fields[i]} ]]; then
      opt+=("$a: ${fields[i]}")
    fi
  i=$((i+1))
  done

  ldbadd -H /var/lib/samba/private/sam.ldb <<EOF
dn: cn=${fields[0]},ou=$group,ou=People,dc=c3edu,dc=online
sAMAccountName: ${fields[0]}
C3UserRole: ${fields[1]}
unicodePwd:: $pwd
givenName: ${fields[3]}
displayName: $displayname
userAccountControl: 66056
objectClass: User
${opt[*]}
EOF
done < $1

exit 0
