(async function injectScamDomainsToZTE() {
    console.log("%c=== STARTING AUTOMATED PARENTAL CONTROLS INJECTION ===", "color: #017297; font-size: 14px; font-weight: bold;");

    const domains = ["aboutyou-lichidari.top", "aboutyou-outlet.cc", "aboutyou-promo.site", "aboutyou-romania.online", "ajutor-copii-sarmani.cc", "altex-lichidari.top", "amenda-auto.online", "amenda-circulatie.site", "amenda-rutiera.cc", "amenzi-circulatie.cc", "amenzi-romania.top", "amazon-recruiter.top", "amazon-tasks.cc", "articulatii-forte.site", "aurum-trade.vip", "biserica-ortodoxa-ajutor.top", "bliss-body.site", "blissbody-watches.top", "cnadnr-rovinieta.cc", "colet-adresa.top", "colet-verificare.cc", "crypto-profit.cc", "csgo-skins-roll.vip", "cumpara-permis.cc", "curier-livrare.top", "depozitul-de-telefoane.site", "diabet-remediu.online", "doctor-recomandare.site", "donatii-urgente.site", "dpd-colet.top", "dpd-livrare.cc", "dpd-tracking.site", "earn-daily.vip", "ecowatt-shop.top", "emag-campanii.site", "emag-iphone100lei.top", "emag-lichidare.top", "emag-oferte-promo.cc", "energie-economie.site", "energo-invest.cc", "erovinieta-taxe.top", "fancourier-colet.cc", "fancourier-confirmare.site", "fancourier-ro.top", "fancourier-taxe.cc", "fx-alexandru.top", "fxalexandru.site", "ghisaul.ro", "ghiseal.ro", "ghiseul-autentificare.cc", "ghiseul-online.cc", "ghiseul-plata.cc", "ghiseul-ro.cc", "ghiseul-taxe.cc", "ghiseul.cfd", "ghiseul.fun", "ghiseul.icu", "ghiseul.site", "ghiseul.top", "ghiseul.vip", "ghisiul.ro", "ghizeul.ro", "grm-task.app", "grm-vip.top", "hidroelectrica-actiuni.top", "hidroelectrica-invest.cc", "hidroelectrica-profit.vip", "instagram-support-ro.site", "instagram-verify-badge.top", "investitii-romania.cc", "investitii-sigure.cc", "labubu-figures.cc", "labubu-official.top", "labubu-romania.shop", "labubu-store.cc", "lucrari-licenta-rapide.site", "mafa-app.vip", "mafa-vip.top", "maicuta-zenaida.cc", "maicuta-zenaida.top", "maxbillionaires.com", "maxbillionaires.top", "media-job.top", "mediagalaxy-outlet.top", "mediagalaxy-promo.cc", "mediagalaxy-reducere.site", "mega-lichidari.top", "meta-verify-center.cc", "miracle-cur.top", "miraclewatt-romania.cc", "nelson-finance.top", "nelson-finance.vip", "nlco.com", "oferte-emag.site", "olx-acceptare.site", "olx-bani.pw", "olx-card.live", "olx-confirmare.site", "olx-incasare.top", "olx-livrare.space", "olx-plata.site", "olx-primire.top", "olx-ro.cc", "olx-romania.cc", "olx-siguranta.cc", "online-jobs-romania.site", "outlet-romania.online", "pachet-actualizare.site", "permis-auto-garantat.cc", "permis-legal-rapid.top", "permis-rapid-romania.top", "permisauto-oficial.vip", "permise-romania.site", "petrom-invest.top", "petrom-profit.site", "plata-amenda.site", "plata-amenzi.top", "politia-romana.cc", "politia-rutiera.cc", "politia-sanctiuni.top", "posta-colet-verificare.cc", "posta-colet.cfd", "posta-livrare.site", "posta-pachet.vip", "posta-romana-colet.top", "posta-romana.cc", "posta-romana.online", "posta-taxe-vama.top", "posta-taxe.cc", "posta-tracking.top", "postaromana-ro.cc", "postaromana-urgent.rest", "postaromana.cc", "postaromana.top", "powerfactor-saver.online", "profit-romania.vip", "prostata-sanatoasa.cc", "prostata-vindecare.top", "publi24-livrare.top", "publi24-plata.cc", "quantum-ai-romania.site", "quantumai-oficial.top", "redactare-licenta.top", "romgaz-actiuni.vip", "romgaz-investitii.cc", "romgaz-platform.top", "rose-app.vip", "rose-earn.cc", "rose-vip.top", "rovinieta-control.site", "rovinieta-plata.cc", "rovinieta-romania.top", "roviniete-verificare.cc", "sameday-colet.cc", "sameday-curier.cc", "sameday-expres.top", "sameday-livrare.site", "sameday-tracking.online", "samsung-promo.vip", "sanatate-articulatii.cc", "steam-gift-card.cc", "steam-tournament-vote.site", "steamcommunity-login.cc", "steamcommunity-trade.cc", "steamcomunuty.top", "super-oferte.cc", "tamaduitoarea-elena.top", "task-romania.vip", "tiktok-earn.cc", "tiktok-tasks.vip", "video-earner.vip", "vindecator-parinte.site", "vinted-colet.top", "vinted-incasare.cc", "vinted-pay.cc", "vinted-plata.space", "vinted-romania.site", "vinted-siguranta.cc", "voetbalshop-nlco.com", "voltbox-official.top", "voltbox-romania.cc", "youtube-brand-deal.cc"];
    const rules = [0, 1, 2]; // Regulile 1, 2, 3 din interfata ZTE

    for (let r of rules) {
        console.log(`%c---> Procesare Regula ${r + 1} (index ${r})...`, "color: #2196F3; font-weight: bold;");

        // 1. Expandeaza acordionul regulii daca este restrans
        let instHeader = $(`#instName_ParentCtrl\\:${r}`);
        let urlCfgArea = $(`#div_URLCfgArea\\:${r}`);

        if (urlCfgArea.length === 0 || urlCfgArea.is(":hidden")) {
            console.log(`Expandare acordion Regula ${r + 1}...`);
            instHeader.click();
            await new Promise(res => setTimeout(res, 600));
        }

        urlCfgArea = $(`#div_URLCfgArea\\:${r}`);
        if (urlCfgArea.length === 0) {
            console.error(`Nu a fost gasita zona URL pentru Regula ${r + 1}`);
            continue;
        }

        // Asigura ca modul este 'BlackList' (URL Black List)
        let filterMode = $(`#FilterMode\\:${r}`);
        if (filterMode.length > 0 && filterMode.val() !== "BlackList") {
            filterMode.val("BlackList").trigger("change");
            await new Promise(res => setTimeout(res, 200));
        }

        let addedCount = 0;
        let skippedCount = 0;

        for (let d of domains) {
            let inputs = $(`#div_URLCfgArea\\:${r} input[type='text']`);
            let existingVals = [];
            inputs.each(function() {
                let val = $(this).val().trim().toLowerCase();
                if (val) existingVals.push(val);
            });

            if (existingVals.includes(d.toLowerCase())) {
                skippedCount++;
                continue;
            }

            // Gaseste un input gol sau apasa pe '+'
            let emptyInput = null;
            inputs.each(function() {
                if (!$(this).val().trim()) {
                    emptyInput = $(this);
                    return false;
                }
            });

            if (!emptyInput) {
                let countBefore = inputs.length;
                let addBtn = $(`#div_URLCfgArea\\:${r} .AddIconControl`);
                if (addBtn.length === 0) {
                    console.warn(`[!] Nu s-a gasit butonul '+' in Regula ${r + 1}!`);
                    break;
                }
                addBtn.click();
                await new Promise(res => setTimeout(res, 80));

                let countAfter = $(`#div_URLCfgArea\\:${r} input[type='text']`).length;
                if (countAfter === countBefore) {
                    console.warn(`%c[!] Limita maxima de URL-uri atinsa pentru Regula ${r + 1} (${countBefore} URL-uri permise de router).`, "color: orange; font-weight: bold;");
                    break;
                }
                emptyInput = $(`#div_URLCfgArea\\:${r} input[type='text']`).last();
            }

            if (emptyInput && emptyInput.length > 0) {
                emptyInput.val(d).trigger('input').trigger('change');
                addedCount++;
            }
        }

        console.log(`%c[✔] Regula ${r + 1}: Adaugate ${addedCount} domenii noi (${skippedCount} erau deja prezente).`, "color: green; font-weight: bold;");

        // Click pe Apply pentru regula curenta
        let applyBtn = $(`#Btn_apply_ParentCtrl\\:${r}`);
        if (applyBtn.length > 0 && !applyBtn.hasClass("disableBtn")) {
            console.log(`Salvare modificari (Apply) pentru Regula ${r + 1}...`);
            applyBtn.click();
            console.log(`Regula ${r + 1} salvata. Asteptare sincronizare router...`);
            await new Promise(res => setTimeout(res, 2500));
        }
    }

    console.log("%c=== TOATE CELE 3 REGULI AU FOST SALVATE CU SUCCES! ===", "color: #4CAF50; font-size: 16px; font-weight: bold;");
})();
