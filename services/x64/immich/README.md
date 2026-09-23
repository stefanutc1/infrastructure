# Immich Self-Hosted Photo & Video Backup Suite

Acest modul implementează platforma de backup, indexare automată și clasificare inteligentă a fotografiilor și videoclipurilor.

## 1. Arhitectură și Servicii

* **`immich-server`**: Punctul central API (port `2283`), gestionează autentificarea utilizatorilor, transcoderul video (FFmpeg) și interfața Web/Mobil.
* **`immich-machine-learning`**: Serviciu dedicat de procesare neuronală (CLIP pentru căutare semantică după text în poze și Facial Recognition pentru detecție persoane).
* **`database`**: PostgreSQL cu extensia `pgvecto-rs` pentru indexarea embeddings-urilor generate de modelul CLIP.
* **`redis`**: Mecanism de cozi distribuite pentru procesarea asincronă a albumelor și thumbnail-urilor.

## 2. Pornire

```bash
cp .env.example .env
# Configurați parola bazei de date și calea către stocare
docker compose up -d
```

Interfața devine accesibilă la: `http://<HOST_IP>:2283`.
