# Propunere Investigativă YouTube – Ciprian Lospa / Investigative Content Proposal

**Destinatar:** Ciprian Lospa (`ciprianlospa`)  
**Expeditor:** Ștefănuț (`boostcroyale18@gmail.com`)  
**Tema:** Investigarea tehnică a rețelei chinezești de phishing / reclame sponsorizate TikTok (Media Galaxy Clone)  

---

## 🇷🇴 Versiunea în Limba Română (Original)

**Subiect:** Propunere material YouTube (analiză material de phishing prin impersonarea Media Galaxy)  
**De la:** Ștefănuț `<boostcroyale18@gmail.com>`  
**Către:** `ciprianlospa`  

Salut, Ciprian,

Urmăresc zona de investigații pe digital și cybersecurity și te urmăresc de ani buni pe YouTube. Zilele astea m-am ocupat de o campanie activă de phishing care imită MediaGalaxy, rulată pe un subdomeniu olandez ([mediagalaxy.voetbalshop-nlco.com](http://mediagalaxy.voetbalshop-nlco.com/)) cu SSL de la Let's Encrypt și integrări extinse de telemetrie (pixeli Meta și TikTok). Mama mea a fost victima acestei țepe în materie de phishing, luându-i-se suma de 118 lei, deja am pregătit demersurile legale de a face un chargeback cu ajutorul băncii, iar acum doresc să îți propun un material ca să nu fie și alții țepuiți. Trecând la o notă mai tehnică, mai jos ai o mică descriere.

Am disecat kitul lor: de la pagina falsă de "Unsubscribe" și câmpurile de date, până la scripturile din spate și comportamentul endpoint-urilor. După ce le-am testat fluxurile și am analizat solicitările din backend, operatorii și-au dat seama că le umblă cineva prin capotă și au aruncat rapid un ecran de "maintenance" (HTTP 200 cu mască) ca să tragă obloanele.

Dacă te interesează detalii tehnice brute, payload-uri, vectori de livrare sau schema de tracking pentru un material sau o discuție pe tema asta, le poți regăsi în acest repozitor de GitHub: [https://github.com/stefanutc1/infrastructure/tree/main/cyber/mediagalaxy-ecommerce-fraud-forensics](https://github.com/stefanutc1/infrastructure/tree/main/cyber/mediagalaxy-ecommerce-fraud-forensics) sau mă poți contacta înapoi.

Spor și o zi frumoasă să ai!

---

## 🇬🇧 English Translation

**Subject:** YouTube Investigation Proposal: Technical Teardown of Media Galaxy Phishing Campaign  
**From:** Ștefănuț `<boostcroyale18@gmail.com>`  
**To:** `ciprianlospa`  

Hey Ciprian,

I follow your digital investigations and cybersecurity coverage closely and have been a subscriber on YouTube for years. Recently, I tackled an active phishing campaign impersonating Media Galaxy, operating on an aged Dutch subdomain ([mediagalaxy.voetbalshop-nlco.com](http://mediagalaxy.voetbalshop-nlco.com/)) equipped with Let's Encrypt SSL and heavy telemetry integration (Meta and TikTok pixels). My mother fell victim to this scam, losing 118 RON (~€24). I have already initiated the formal bank chargeback dispute process, and now I want to pitch this investigation so other citizens don't fall for the same trap.

On a technical note, here is what I uncovered:  
I tore down their phishing kit completely: from the counterfeit "Unsubscribe" mechanisms and form handlers, down to their backend telemetry scripts and API endpoint behavior. While actively fingerprinting their workflows and probing their backend endpoints, the threat actors detected that someone was reverse engineering their stack and swiftly served a dummy "Website is under maintenance" screen (HTTP 200 cloaking mask) to close shop.

If you are interested in raw forensic evidence, payloads, delivery vectors, or their tracking topology for an episode or discussion, you can find the complete investigation artifacts in this GitHub repository: [https://github.com/stefanutc1/infrastructure/tree/main/cyber/mediagalaxy-ecommerce-fraud-forensics](https://github.com/stefanutc1/infrastructure/tree/main/cyber/mediagalaxy-ecommerce-fraud-forensics), or reply to this email.

Keep up the great work and have a great day!
