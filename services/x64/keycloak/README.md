# Keycloak Identity & Access Management (IAM)

Keycloak asigură federarea identităților din **Active Directory Domain Services** și expune protocoale standard **OIDC / OAuth 2.0 / SAML** pentru toate serviciile web din infrastructură (Harbor, ArgoCD, Grafana, Portainer, Nextcloud, BookStack, etc.).

## Integrare cu Active Directory (AD DS)

1. Autentificare în consola de administrare: `http://<HOST_IP>:8484`.
2. Navigare la: **User Federation** -> **Add LDAP provider**.
3. Setare parametri conexiune:
   * **Vendor:** Active Directory
   * **Connection URL:** `ldap://192.168.1.130:389` (sau `ldaps://...:636`)
   * **Users DN:** `CN=Users,DC=infrastructure,DC=lan`
   * **Bind DN:** `CN=Administrator,CN=Users,DC=infrastructure,DC=lan`
   * **Edit Mode:** READ_ONLY (sau UNSYNCED)
   * **Sync Registrations:** Active

Toți utilizatorii și grupurile definite în AD devin instant autentificabile prin SSO în orice serviciu integrat cu Keycloak.
