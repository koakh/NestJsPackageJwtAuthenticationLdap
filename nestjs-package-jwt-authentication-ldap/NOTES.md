# NOTES

## LDAP Commands

### Create a default c3 user with `User` group

```
[11:20 AM] André Gomes
  dn: cn=<username>,ou=<role>,ou=People,dc=c3edu,dc=online
  sAMAccountName: <username>
  givenName: <first name>
  displayName: <first name>( <last name>)?
  userAccountControl: 66056
  objectClass: User
  opcionais:
  sn dateOfBirth mail gender telephoneNumber studentID
​[11:21 AM] André Gomes
  estes são os atributos a alterar ao inserir
​[11:22 AM] André Gomes
  e depois no grupo adicionar ao "member" e automaticamente actualiza o memberOf
```

```
ou=<role> e o Group correcto ex Users ?
<role> c3student,c3administrator,c3teacher,c3parent
[11:32 AM] Mário Monteiro
e uma delas apenas?
​[11:32 AM] André Gomes
sim
```

```
​[11:32 AM] André Gomes
  o useraccountcontrol pode ficar 66058 se a a conta for desactivada
  para se desactivar a contar tem de se alterar o useraccountcontrol senão conseguem fazer login pelo windows se estiverem no domínio

[11:35 AM] Mário Monteiro
    quer dizer q o `sudo samba-tool user disable USER` nao e suficiente entao?
​[11:36 AM] Mário Monteiro
  era esse e q eu falava q ele ALTERA a flag ou useraccountcontrol
  mas altera para outro UserAccountControl Attribute/Flag Value
  sem ser o 66058
​[11:36 AM] Mário Monteiro
  entao as flags possiveis sao APENAS ESTAS?
  userAccountControl: 66056
  userAccountControl: 66058
​[11:41 AM] André Gomes
    sim, são essas
[11:41 AM] André Gomes
  faz o mesmo. o useraccountcontrol, cada bit representa uma opção diferente. o bit de desactivar a conta é 2. basicamente se a contar estiver enabled basta incrementar o useraccountcontrol por 2.
```

```
[11:41 AM] André Gomes
  já agora pass antes de ir para base64 tem de convertida para utf16 little endian

encodeAdPassword(utf8) {
  const quoteEncoded = '"' + '\000';
  let utf16le = quoteEncoded;
  // eslint-disable-next-line no-plusplus
  for (let i = 0, n = utf8.length; i < n; ++i) {
  utf16le += utf8[i] + '\000';
}
utf16le += quoteEncoded;
return utf16le;
}
```

```shell
$ USER="pelo"
$ GROUP="Users"
$ sudo samba-tool user create "${USER}" password
$ sudo samba-tool group addmembers "${GROUP}" "${USER}"
dn: CN=alex,CN=Users,DC=c3edu,DC=online
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: alex
instanceType: 4
whenCreated: 20201105105336.0Z
whenChanged: 20201105105336.0Z
uSNCreated: 114831
name: alex
objectGUID: dfc0f0e3-f11f-4f83-aefa-c1c7da9129da
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
primaryGroupID: 513
objectSid: S-1-5-21-2980122354-4183335993-4006154015-111127
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: alex
sAMAccountType: 805306368
userPrincipalName: alex@c3edu.online
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online
pwdLastSet: 132490472162572370
userAccountControl: 512
uSNChanged: 114833
memberOf: CN=Users,CN=Builtin,DC=c3edu,DC=online
distinguishedName: CN=alex,CN=Users,DC=c3edu,DC=online

# copy paste lines: benchmark search
GROUP="Users"
CMD="sudo samba-tool group listmembers ${GROUP}"
START_TIME="$(date -u +%s.%N)"
${CMD}
END_TIME="$(date -u +%s.%N)"
ELAPSED="$(bc <<<"${END_TIME}-${START_TIME}")"
echo "Total of ${ELAPSED} seconds elapsed for process"

# show user
$ sudo samba-tool user show "${USER}"
```
