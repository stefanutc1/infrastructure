# NetBox — Source of Truth pentru DCIM & IPAM

NetBox este punctul central de adevăr (*Single Source of Truth*) pentru întreaga infrastructură:
* Managementul subneturilor, VLAN-urilor și alocărilor de adrese IP statice/DHCP.
* Inventarul rack-urilor, nodurilor fizice, VM-urilor Proxmox și containerelor LXC.
* Integrare nativă cu Ansible (`netbox.netbox.nb_inventory`) și Terraform (`netbox-community/netbox`).

## Pornire

```bash
cp .env.example .env
# Generați un SECRET_KEY și token de administrare
docker compose up -d
```

Interfața web este disponibilă la: `http://<HOST_IP>:8000`.
