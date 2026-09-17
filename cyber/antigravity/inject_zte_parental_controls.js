(async function injectExtendedBlocklistToZTE() {
    console.log("%c=== STARTING AUTOMATED ROUTER RULE INJECTION ===", "color: #017297; font-size: 14px; font-weight: bold;");

    const domains = ["4tube.com", "aboutyou-lichidari.top", "aboutyou-outlet.cc", "aboutyou-promo.site", "aboutyou-romania.online", "ad-checker.icu", "ad-delivery-network.com", "ad-gateway-cloud.cc", "ad-traffic-flow.vip", "adidas-clearance-sale.online", "adultfriendfinder.com", "aff-direct.site", "ai-trading-bot-pro.site", "ajutor-copii-sarmani.cc", "alphabank-clienti.top", "altcoin-trader.vip", "altex-lichidari.top", "amazon-recruiter.top", "amazon-tasks.cc", "amenda-auto.online", "amenda-circulatie.site", "amenda-rutiera.cc", "amenzi-circulatie.cc", "amenzi-romania.top", "anunturi-matrimoniale.ro", "anysex.com", "apple-warehouse-clearance.top", "articulatii-forte.site", "aurum-trade.vip", "badjojo.com", "balenciaga-sale-ro.online", "banca-transilvania-invest.site", "bancatransilvania-siguranta.top", "bangbros.com", "bazoocam.org", "bcr-actualizare-date.cc", "bcr-profit-romania.top", "bcr-securitate.top", "beeg.com", "binance-airdrop-claim.top", "biserica-ortodoxa-ajutor.top", "bitcoin-era-official.com", "bitiq-platform.site", "bliss-body.site", "blissbody-watches.top", "bonga-cams.com", "bongacams.com", "bongacams.ro", "brazzers.com", "brd-actualizare-card.top", "brd-net-securitate.site", "bt24-autentificare.cc", "bybit-bonus-romania.cc", "cam-romania.com", "cam4.com", "camfrog.com", "cams.com", "camsoda.com", "camster.com", "camversity.com", "camwhores.tv", "camwhores.video", "cec-bank-online.top", "cec-investitii-sigure.cc", "cec-securitate-clienti.site", "chatrandom.com", "chaturbate.com", "click-convert-pro.top", "click-track.link", "cloud-traffic.top", "club-matrimoniale.ro", "cnadnr-rovinieta.cc", "colet-adresa.top", "colet-verificare.cc", "coomer.party", "coomer.su", "crypto-engine-pro.com", "crypto-profit.cc", "csgo-skins-roll.vip", "cumlouder.com", "cumpara-permis.cc", "curier-livrare.top", "czechav.com", "daftsex.com", "depozitul-de-telefoane.site", "diabet-remediu.online", "digitalplayground.com", "dinotube.com", "direct-promo-hub.online", "dirtyroulette.com", "doctor-recomandare.site", "donatii-urgente.site", "dpd-colet.top", "dpd-livrare.cc", "dpd-tracking.site", "drporno.com", "dyson-airwrap-promo.top", "dyson-outlet-online.shop", "earn-daily.vip", "ecowatt-shop.top", "emag-campanii.site", "emag-iphone100lei.top", "emag-lichidare.top", "emag-oferte-promo.cc", "empflix.com", "energie-economie.site", "energo-invest.cc", "eporner.com", "erome.com", "erovinieta-taxe.top", "escorte-bucuresti.xxx", "escorte-iasi.net", "escorte-ro.com", "escorte-vip-romania.com", "espressoare-lichidari.site", "ethereum-code-pro.com", "evilangel.com", "fancourier-colet.cc", "fancourier-confirmare.site", "fancourier-ro.top", "fancourier-taxe.cc", "fapdungeon.com", "faphouse.com", "fapvid.com", "fast-lead-generator.top", "fast-redirect.me", "fete-cluj.com", "fete-dulci.com", "fete-intime.ro", "fete-ro.com", "fete-sexy.ro", "flingster.com", "flirt4free.com", "flirtymania.com", "freeomovie.com", "fullporner.com", "fuq.com", "fx-alexandru.top", "fxalexandru.site", "gas-profit-app.com", "ghisaul.ro", "ghiseal.ro", "ghiseul-autentificare.cc", "ghiseul-online.cc", "ghiseul-plata.cc", "ghiseul-ro.cc", "ghiseul-taxe.cc", "ghiseul.cfd", "ghiseul.fun", "ghiseul.icu", "ghiseul.site", "ghiseul.top", "ghiseul.vip", "ghisiul.ro", "ghizeul.ro", "global-offer.online", "gotporn.com", "grm-task.app", "grm-vip.top", "gucci-outlet-official.site", "hclips.com", "hdpornfull.com", "heavy-r.com", "hidroelectrica-actiuni-romania.com", "hidroelectrica-actiuni.top", "hidroelectrica-invest.cc", "hidroelectrica-profit.vip", "hqporner.com", "imlive.com", "immediate-connect.online", "immediate-edge-app.com", "immediate-matrix.cc", "immediate-vortex.site", "ing-actualizare-clienti.top", "ing-homebank-verificare.cc", "ing-investitii-capital.site", "instagram-support-ro.site", "instagram-verify-badge.top", "intalniri-discrete.com", "investitii-romania.cc", "investitii-sigure.cc", "iphone-depozit-romania.site", "jable.tv", "jasmin.com", "jasmin.ro", "javhd.com", "jerkmate.com", "jordan-retro-sales.cc", "jporn.vip", "kemono.party", "kemono.su", "kucoin-giveaway.vip", "labubu-figures.cc", "labubu-official.top", "labubu-romania.shop", "labubu-store.cc", "landing-cdn.com", "lego-clearance-store.com", "libra-bank-online.cc", "livejasmin.com", "livejasmin.ro", "lobstertube.com", "louisvuitton-promo.top", "lucrari-licenta-rapide.site", "luxury-discount-store.cc", "mafa-app.vip", "mafa-vip.top", "maicuta-zenaida.cc", "maicuta-zenaida.top", "matrimoniale-bucuresti.com", "matrimoniale-ro.com", "matrimoniale-romania.cc", "matrimoniale-timisoara.ro", "maxbillionaires.com", "maxbillionaires.top", "media-ad-server.cc", "media-job.top", "mediagalaxy-outlet.top", "mediagalaxy-promo.cc", "mediagalaxy-reducere.site", "mega-lichidari.top", "meta-verify-center.cc", "miracle-cur.top", "miraclewatt-romania.cc", "missav.com", "modele-romania.com", "mofos.com", "moncler-winter-sale.top", "motherless.com", "myfreecams.com", "naughtyamerica.com", "nelson-finance.top", "nelson-finance.vip", "netvideogirls.com", "nike-factory-vip.top", "nimfomane.com", "nlco.com", "nuclearelectrica-profit.cc", "nuvid.com", "oferte-emag.site", "offer-vault.net", "oil-profit-system.net", "olx-acceptare.site", "olx-bani.pw", "olx-card.live", "olx-confirmare.site", "olx-incasare.top", "olx-livrare.space", "olx-plata.site", "olx-primire.top", "olx-ro.cc", "olx-romania.cc", "olx-siguranta.cc", "omegle-adult.com", "omv-investitii-oficial.top", "online-jobs-romania.site", "outlet-romania.online", "pachet-actualizare.site", "permis-auto-garantat.cc", "permis-legal-rapid.top", "permis-rapid-romania.top", "permisauto-oficial.vip", "permise-romania.site", "petrom-invest.top", "petrom-profit.site", "phncdn.com", "pixel-tracker-cloud.site", "plata-amenda.site", "plata-amenzi.top", "playstation5-reducere.cc", "politia-romana.cc", "politia-rutiera.cc", "politia-sanctiuni.top", "porn300.com", "pornbox.com", "pornburst.xxx", "porndoe.com", "pornhat.com", "pornhub.com", "pornktube.com", "pornmd.com", "pornomovies.com", "pornone.com", "pornrabbit.com", "porntrex.com", "porntube.com", "pornxs.com", "posta-colet-verificare.cc", "posta-colet.cfd", "posta-livrare.site", "posta-pachet.vip", "posta-romana-colet.top", "posta-romana.cc", "posta-romana.online", "posta-taxe-vama.top", "posta-taxe.cc", "posta-tracking.top", "postaromana-ro.cc", "postaromana-urgent.rest", "postaromana.cc", "postaromana.top", "powerfactor-saver.online", "prada-outlet-store.cc", "profit-revolution.online", "profit-romania.vip", "promo-direct.cc", "prostata-sanatoasa.cc", "prostata-vindecare.top", "publi24-livrare.top", "publi24-matrimoniale.cc", "publi24-plata.cc", "puma-factory-outlet.site", "quantum-ai-romania.site", "quantum-ai-trading.top", "quantum-trade-app.com", "quantumai-oficial.top", "raiffeisen-autentificare.site", "raiffeisen-profit-app.online", "raiffeisen-securitate.cc", "raybanshop-sale.com", "realitykings.com", "redactare-licenta.top", "redirect-stream.net", "redtube.com", "revolut-crypto-bonus.top", "revolut-security-alert.cc", "revolut-unfreeze-account.site", "revolut-verify-identity.top", "rolex-replica-shop.com", "romania-escort.com", "romgaz-actiuni.vip", "romgaz-invest.org", "romgaz-investitii.cc", "romgaz-platform.top", "rose-app.vip", "rose-earn.cc", "rose-vip.top", "roulette.chat", "rovinieta-control.site", "rovinieta-plata.cc", "rovinieta-romania.top", "roviniete-verificare.cc", "sameday-colet.cc", "sameday-curier.cc", "sameday-expres.top", "sameday-livrare.site", "sameday-tracking.online", "samsung-promo.vip", "sanatate-articulatii.cc", "secure-gate.site", "severeporn.com", "sex-anonim.com", "sex-romanesc.xxx", "shagle.com", "shein-outlet-vip.shop", "sleazyneasy.com", "smart-link-direct.com", "sneakers-outlet-ro.top", "spankbang.com", "steam-gift-card.cc", "steam-tournament-vote.site", "steamcommunity-login.cc", "steamcommunity-trade.cc", "steamcomunuty.top", "stoneisland-outlet.vip", "streamate.com", "streamporn.pw", "stripchat.com", "studio-videochat-iasi.ro", "sunporno.com", "super-oferte.cc", "supjav.com", "tamaduitoarea-elena.top", "task-romania.vip", "tesla-investment-ai.com", "thermomix-oferta-speciala.cc", "thumbzilla.com", "tiktok-earn.cc", "tiktok-tasks.vip", "tnaflix.com", "top-escorte.ro", "track-lead.top", "track-traffic-system.com", "trade-republic-promo.cc", "traffic-hub.vip", "traffic-router.icu", "tube8.com", "tubegalore.com", "twistys.com", "txxx.com", "unicredit-autentificare.cc", "upornia.com", "video-earner.vip", "videochat-bucuresti.com", "vindecator-parinte.site", "vinted-colet.top", "vinted-incasare.cc", "vinted-pay.cc", "vinted-plata.space", "vinted-romania.site", "vinted-siguranta.cc", "vjav.com", "voetbalshop-nlco.com", "voltbox-official.top", "voltbox-romania.cc", "webcammodelle.com", "wicked.com", "xcafe.com", "xhamster.com", "xhamsterlive.com", "xmegadrive.com", "xnxx-cdn.com", "xnxx.com", "xvideos-cdn.com", "xvideos.com", "youjizz.com", "youporn.com", "youtube-brand-deal.cc", "zara-clearance.store", "zbporn.com"];
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

        // Asigura modul BlackList
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
