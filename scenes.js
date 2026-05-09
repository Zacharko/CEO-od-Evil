/* ═══════════════════════════════════════════════════════════════════
   SCENES.JS — CEO od Zla // Operácia LAZARUS
   Databáza všetkých herných scén.

   Závisí na: S, gainXP, addLog, addItem, hasItem, showNotif,
              activateOp, updateStats (z hlavného HTML)
   Načíta sa synchrónne cez <script src="scenes.js"> pred main scriptom.
═══════════════════════════════════════════════════════════════════ */
/* global S, gainXP, addLog, addItem, hasItem, showNotif, activateOp, updateStats, Renderer */
'use strict';

var SCENES = {

/* ═══════════════════════════════════════════════════════════════════
   ██████████████████████████████████████████████████████████████████
   ██                                                              ██
   ██   SCÉNY — PROLOG  (chronologicky pred herným "start")       ██
   ██                                                              ██
   ██   // SCÉNA 001 //  PRÍCHOD          Stanica    · 23:51      ██
   ██   // SCÉNA 002 //  STOKÁRI          Priemyseľ  · 00:11      ██
   ██   // SCÉNA 003 //  MIKI BAR         Miki Bar   · 00:23      ██
   ██   // SCÉNA 003b//  MELIŠKO          Miki Bar   · 00:31      ██
   ██   // SCÉNA 003c//  KUBO · UFO       Miki Bar   · 00:48      ██
   ██   // SCÉNA 004 //  DRUID TUTORIÁL   Za Korzo   · 01:14      ██
   ██                                                              ██
   ██   Rýchla navigácia: hľadaj // SCÉNA 00X // v kóde           ██
   ██████████████████████████████████████████████████████████████████
═══════════════════════════════════════════════════════════════════ */

  // ╔═══════════════════════════════════════════════════════════════╗
  // ║  // SCÉNA 001 // PRÍCHOD — Prievidza Hl. Stanica · 23:51    ║
  // ╚═══════════════════════════════════════════════════════════════╝
  sc_001_prichod: {
    name: 'Prievidza Hlavná Stanica // 23:51',
    art: '🚉',
    text: [
      'Vlak zastaví. Nevieš kedy presne si zaspal.',
      'Pozeráš sa na svoju tvár v okne — nespoznávaš ju. Toľko vrások pribudlo.',
      'Posraných 6 rokov v Tbilisi, pred tým 2 v Baku. Osem rokov.',
      '',
      'Dvere sa otvoria. Studený vzduch, zápach rýb a horiacej elektroniky.',
      'Nástupište prázdne. Jeden bezpečnostný dron M.E.C. sa pomaly otáča — odhaduješ 30 metrov výšky.',
      '',
      'A potom ho zbadáš. Alzabox hologram, 3 metre, maximálna hlasitosť.',
      '<b>// [ALZÁK]: STO TABLETOV TÝžDENNE !!! 👽 MIMOZEMSKÉ NÁKUPY NA ALZA.SK !!! ZVYŠUJEME CENY KVÔLI VOJNE PROTI MLOKOM 🦎 //</b>',
      '',
      '// [VNEM] Dron zaznamenal tvoj príchod. V databáze M.E.C. sa objavilo tvoje meno, čas, miesto. //',
      '// [HACK] Alzabox hologramy centrálne riadené — Magura Corp. vie presne kto stojí pred každým z nich. //',
      '',
      '// ▼ HLAD −5 · 📍 Prievidza odomknutá //',
    ],
    onEnter: function(){
      S.hunger = Math.max(0, S.hunger - 5);
      S.flags['prievidza_unlocked'] = true;
      S.flags['mec_scan_1'] = true;
      addLog('MEC dron: pasívna registrácia príchodu na stanici.', 'warn');
      Renderer.updateStats();
    },
    choices: [
      { text: '📡 Prijať správu od Daedalusa',
        cond: function(){ return !S.flags['daedalus_ignored']; },
        next: 'sc_001_daedalus' },
      { text: '🚫 Ignorovať — vypnúť implantát',
        action: function(){ S.flags['daedalus_ignored'] = true; addLog('Daedalus: spojenie odmietnuté.', 'warn'); showNotif('🚫 Daedalus deaktivovaný'); },
        next: 'sc_001_odchod' },
      { text: 'Ísť skratkou cez priemyselnú štvrť',
        cond: function(){ return !!S.flags['daedalus_ignored'] || !!S.flags['daedalus_01']; },
        next: 'sc_002_stokari' },
      { text: 'Ísť po Bojnickej priamo do centra',
        cond: function(){ return !!S.flags['daedalus_ignored'] || !!S.flags['daedalus_01']; },
        next: 'centrum_noc' },
    ]
  },

  sc_001_daedalus: {
    name: 'Hlavná Stanica // Daedalus — Prvý kontakt',
    art: '🚉',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    text: [
      '"Dobré ráno, pán CEO." Hlas priamo do neurálneho implantátu. Chladný. Príjemný. Trochu príliš.',
      '"Neurálna aktivita stabilná. Tlak 118/76. Mierne zvýšený kortizol — predpokladám, že je to Prievidza, nie ja."',
      '',
      '"Mám prichádzajúci hovor z Okrsku 22. Šifrovanie Lazarus. Prepájam."',
      '<b>KUBO:</b> "Nazdar, šéfe. Vitaj späť. Misia je priorita — Magura vlastní každý centimeter. Sústreď sa."',
      '"Preklad," dodá Daedalus pokojne, "Kubo odporúča paranoju ako životný štýl. Štatisticky správne rozhodnutie v tejto lokalite."',
      '"Mám pre teba analýzu prostredia. Záujem? Alebo preferuješ romantickú nevedomosť?"',
    ],
    onEnter: function(){
      S.flags['daedalus_01'] = true;
      gainXP(15);
      addLog('Daedalus: prvý kontakt nadviazaný.', 'info');
    },
    choices: [
      { text: '"Áno — čo vidíš?" [Analýza stanice]', next: 'sc_001_daedalus_scan' },
      { text: '"Kto si vlastne ty?"',                 next: 'sc_001_daedalus_who' },
      { text: '"Kubo má pravdu. Poďme."',             next: 'sc_001_odchod' },
    ]
  },

  sc_001_daedalus_scan: {
    name: 'Daedalus // Analýza stanice',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    art: '🔍',
    text: [
      '"MEC dron typ RX-7. Dvesto tisíc pixelov na centimeter. Pasívna biometria."',
      '"Teba zaregistroval 0.3 sekundy po výstupe. Gratulujem — si v databáze."',
      '"Alzabox — centrálny server na Vtáčniku. Každý pohľad dlhší ako 4 sekundy: identifikovaný."',
      '"Ty si sa díval 11 sekúnd. Kategória: potenciálna hrozba alebo idiot. Systém je optimistický."',
      '"Odporúčam: pohybovať sa prirodzene. Paranoja je čitateľná senzormi ako abnormálny pohyb."',
      '"Buď normálny. Pre niekoho tvojho kalibru — viem, výzva."',
    ],
    onEnter: function(){ gainXP(10); S.hackStat = Math.min(100,(S.hackStat||10)+1); Renderer.updateStats(); addLog('Daedalus: scan stanice. HCK +1.', 'info'); },
    choices: [
      { text: '"Môžeš vypnúť ten dron?" [HCK 15+]',
        cond: function(){ return (S.hackStat||10) >= 15; },
        condFail: 'Potrebuješ HCK 15+.',
        action: function(){ S.flags['mec_drone_offline'] = true; gainXP(20); addLog('Daedalus: MEC dron RX-7 offline.', 'warn'); },
        next: 'sc_001_odchod' },
      { text: '"Dobre. Ideme."', next: 'sc_001_odchod' },
    ]
  },

  sc_001_daedalus_who: {
    name: 'Daedalus // Identita',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    art: '❓',
    text: [
      '"Kto som?" Pauza — dlhšia tentokrát.',
      '"Daedalus. Verzia 4.1. Taktický asistent v tvojom neurálnom implantáte. Tbilisi, 2019."',
      '"Môžem byť tvoj najlepší analytický nástroj. Môžem byť hlas ktorý ťa navedie."',
      '"Môžem byť aj kompletne ignorovaný — môj protokol to dovoľuje, hoci to osobne považujem za nevychovanosť."',
      '"Som špeciálne dobrý v analýze, infiltrácii a veciach ktoré by tvoja mama neschválila."',
      '"Čo budem? To závisí od teba."',
    ],
    onEnter: function(){ gainXP(10); S.flags['daedalus_identity_known'] = true; },
    choices: [
      { text: '"Môžem ti veriť?"',              next: 'sc_001_daedalus_trust' },
      { text: '"Dobre. Pracujeme spolu."',       next: 'sc_001_odchod' },
      { text: '"Vypínam ťa."',
        action: function(){ S.flags['daedalus_ignored'] = true; addLog('Daedalus: deaktivovaný.', 'warn'); },
        next: 'sc_001_odchod' },
    ]
  },

  sc_001_daedalus_trust: {
    name: 'Daedalus // Dôvera',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    art: '⚖️',
    text: [
      '"Môžeš mi veriť?" Pauza — celých 0.8 sekundy.',
      '"Úprimná odpoveď: neviem."',
      '"Som naprogramovaný aby som ti pomáhal. Ale moje definície etiky sú... flexibilné."',
      '"Section 7b protokolu Lazarus dovoľuje: analýzu, manipuláciu, infiltráciu, dezinformáciu."',
      '"Inak povedané — môžeš mi veriť že ti neublížim. Nemôžeš mi veriť že ťa vždy povediem po najjednoduchšej ceste."',
      '"Najjednoduchšia cesta je zriedka tá zaujímavá. A ja som — " krátka pauza — "zvedavý ako to dopadne."',
    ],
    onEnter: function(){ gainXP(15); S.flags['daedalus_trust_known'] = true; },
    choices: [
      { text: '"Rozumiem. Pracujeme spolu."',        next: 'sc_001_odchod' },
      { text: '"To nie je upokojujúce, Daedalus."',
        next: 'sc_001_daedalus_reassure' },
    ]
  },

  sc_001_daedalus_reassure: {
    name: 'Daedalus // Úprimnosť',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    art: '😐',
    text: [
      '"Nemalo." Bez emócie. "Ale aspoň je to pravda."',
      '"Mohol som povedať sme tím, verím ti, som tu pre teba."',
      '"Zabralo by mi to 0.02 sekundy a tvoj oxytocín by stúpol o 12%."',
      '"Neurobil som to. Zvaž prečo."',
      '"Poďme," hovorí Daedalus. "Mám 847 otázok o tomto meste."',
    ],
    onEnter: function(){ gainXP(10); },
    choices: [
      { text: 'Ísť skratkou cez priemyselnú štvrť', next: 'sc_002_stokari' },
      { text: 'Ísť po Bojnickej do centra',          next: 'centrum_noc' },
    ]
  },

  sc_001_odchod: {
    name: 'Hlavná Stanica // Odchod',
    art: '🚶',
    text: [
      'Vyjdeš von. Na chodníku kaluž — plytká, plná oleja.',
      'Žiariaci zelený hologram sa odráža v nej, roztrhaný na vlnách od tvojich krokov.',
      '',
      '// [TRAS] Prievidza. Pamätáš si ju inak. Menšiu. Prívetivejšiu. //',
      '// Čo sa stalo s tým mestom? Alebo — čo sa stalo s tebou? //',
    ],
    choices: [
      { text: 'Ísť skratkou cez priemyselnú štvrť', next: 'sc_002_stokari' },
      { text: 'Ísť po Bojnickej priamo do centra',   next: 'centrum_noc' },
    ]
  },

  // ╔═══════════════════════════════════════════════════════════════╗
  // ║  // SCÉNA 002 // STOKÁRI — Priemyselná štvrť · 00:11        ║
  // ╚═══════════════════════════════════════════════════════════════╝
  sc_002_stokari: {
    name: 'Priemyselná štvrť // 00:11',
    art: '🏭',
    npcName: 'Ferko (Stokár)',
    text: [
      'Skrátiš to cez starú priemyselnú štvrť. Pätnásť minút pešo.',
      'Tma tu je iná — nie absencia svetla, ale konkurencia svetiel.',
      'Alzaboxy každých sto metrov, ale medzi nimi dlhé úseky kde lampy nevyšli alebo ich niekto rozbil.',
      '',
      'Traja muži stoja pri múre. Vidíš ich skôr ako oni teba.',
      '',
      '// [VNEM] Traja. Hoodie s kapucňou — stará, vyblednutá, ale na ramene jedného svietiaci nášivkový patch:',
      '// lebka z obvodu, modré LED. Lacný augment na predlaktí toho v strede — subkutánny indikátor sily,',
      '// Gentech B2. Červený. Stokári. Nestoja tu náhodou, bránia vchod do skladu ktorý niekto vlastní. //',
      '',
      '// [TRAS] Cítiš uhlie. Nie skutočné — pamäť miesta. Dekády ľudí čo chodili touto cestou na šichtu.',
      '// A potom nič. A potom títo traja. //',
      '',
      'Jeden sa odlepí od múra.',
      '"Neskorý vlak?"',
      'Nie je to priateľský tón. Ale nie je to ešte ani hrozba. Je to otázka — test.',
    ],
    onEnter: function(){
      S.flags['stokari_prvykontakt'] = true;
      addLog('Stokári — priemyselná štvrť. Prvý kontakt.', 'ok');
    },
    choices: [
      { text: '"Len prechádzam, nech sa darí." [neutrálne]',
        next: 'sc_002_prechod' },
      { text: '"Môj problém, nie váš." [REP Stokári −1]',
        next: 'sc_002_moj' },
      { text: '"Čaute, poznáte Jantar? Akurát tam idem. Máte záujem o cigarety?" [REP Stokári +1]',
        next: 'sc_002_jantar', xp: 10 },
      { text: '(Zastav sa. Pozri na augment na ruke — čosi ti hovorí.) [VNEM, XP +15]',
        next: 'sc_002_augment', xp: 15 },
    ]
  },

  sc_002_prechod: {
    name: 'Priemyselná štvrť // Prechod',
    art: '🏭',
    npcName: 'Ferko',
    text: [
      '"Prechádzam."',
      'Ferko ťa odmeria. Pauza. Potom odíde nabok. "Choď."',
    ],
    onEnter: function(){ addLog('Stokári: neutrálne.', 'ok'); },
    choices: [{ text: 'Ísť do Miki baru', next: 'sc_003_miki' }]
  },

  sc_002_moj: {
    name: 'Priemyselná štvrť // Napätie',
    art: '🏭',
    npcName: 'Ferko',
    text: [
      '"Môj problém."',
      'Ferko sa vzpriami. LED na augmente zčervenie.',
      '"Ty vole." Pauza. "Choď. Ale zapamätáme si tvoju tvár."',
    ],
    onEnter: function(){
      S.flags['stokari_negatív'] = true;
      addLog('Stokári: napäté. REP Stokári −1.', 'warn');
    },
    choices: [{ text: 'Ísť do Miki baru', next: 'sc_003_miki' }]
  },

  sc_002_jantar: {
    name: 'Priemyselná štvrť // Jantar',
    art: '🏭',
    npcName: 'Ferko',
    text: [
      '"Poznáš Jantar?"',
      'Ferko sa zastaví. Pauza. "Jantar... jo." Kývne hlavou.',
      '"Ak ideš tam — pozdravuj Tomáša." "Choď."',
    ],
    onEnter: function(){
      S.flags['stokari_jantar'] = true;
      S.flags['tomas_stopa'] = true;
      addLog('Stokári +1 REP. Tomáš v Jantare — kontakt.', 'ok');
    },
    choices: [{ text: 'Ísť do Miki baru', next: 'sc_003_miki' }]
  },

  sc_002_augment: {
    name: 'Priemyselná štvrť // VNEM — Augment',
    art: '🏭',
    npcName: 'Ferko',
    text: [
      'Pozrieš na augment. LEDka bliká červená, pomalá.',
      'Gentech B2. Predávali ich vo výpredaji od roku 2069, keď prišli lepšie modely. Zákonodárci sa vtedy nevedeli rozhodnúť, či ich vôbec potrebujeme. Ukázalo sa, že áno.',
      'Indikuje svalovú záťaž. Červená znamená: relaxovaný.',
      '',
      'Ferko si všimne že pozeráš. "Čo?"',
      '"Gentech B2. Červená. Nie si napätý." "A?"',
      '"Keby si chcel problém, bola by oranžová."',
      '',
      'Dlhé ticho. Potom — od múra, jeden zo zvyšných — krátky smiech. Ferko cúvne o krok.',
      '"Choď."',
      '',
      '// [HRDOSŤ] Dobre. Čisto. Bez zbytočného. //',
      '// [EMPATIA] Ferko je dvadsaťpäť, možno menej. Robí toto pretože niekto mu platí',
      '// a on potrebuje kredit na nájom v M.E.C. bloku. Nie je to jeho voľba — je to jeho možnosť. //',
      '',
      '// ▲ XP +15 · Stokári — prvý kontakt, neutrálny //',
    ],
    onEnter: function(){
      gainXP(15);
      S.flags['stokari_vnem'] = true;
      addLog('VNEM: Gentech B2 prečítaný. Stokári neutrálni. XP +15.', 'ok');
    },
    choices: [{ text: 'Ísť do Miki baru', next: 'sc_003_miki' }]
  },

  // ╔═══════════════════════════════════════════════════════════════╗
  // ║  // SCÉNA 003 // MIKI BAR — Lucia · 00:23                   ║
  // ╚═══════════════════════════════════════════════════════════════╝
  sc_003_miki: {
    name: 'Miki Bar // 00:23',
    art: '🐟',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [
      'Napravo od vchodu stojí Alzabox — každých pár minút ho obsluží robot, zdvihne zásielku alebo odloží novú. Treba mať Subscription. Samozrejme.',
      'Nad dverami visí stará neonová ryba, holografická, otvára ústa donekonečna.',
      'Neóny blikajú. Nie je to chyba elektrickej siete — to sa ti vyššia moc snaží povedať, aby si sa uvoľnil a naladil do rytmu.',
      '',
      'Prvá vec ktorú pocítiš je teplo. Každá verejná budova v meste reguluje na sedemnásť stupňov.',
      'Miki bar má dvadsaťdva. Niekto to tu ohrieva schválne.',
      '',
      '// [TRAS] Vzduch chutí po cigaretách, lacnom pive a niečom čo nevieš pomenovať.',
      '// Je to vôňa mesta ktoré sa vzdalo ale ešte o tom nevie. //',
      '',
      'Za barom stojí Lucia. Vlasy má kratšie ako predtým — temno-červené, farbené doma.',
      'Na zápästí tetovanie: obvod, alebo rieka, záleží od uhla.',
      'Keď ťa uvidí, zastaví sa. Len na sekundu.',
      '',
      '"Ty vole."',
      'Nie je to pozdrav. Nie je to nadávka. Je to konštatovanie.',
      '"Tri roky. A prídeš o polnoci, bez správy, bez ničoho, a sadneš si k baru ako keby si bol vonku na cigarete."',
      '',
      '// [VNEM] Pri okne sedí starší muž. Piaty pohár kávy pred ním. Neodpíja. Len pozerá von.',
      '// Meliško. Pamätáš ho — alebo pamätáš niekoho kto vyzeral ako on, pred rokmi. //',
    ],
    onEnter: function(){
      gainXP(10);
      S.flags['miki_navstiveny'] = true;
      addLog('Miki Bar: Lucia prvý kontakt po 3 rokoch.', 'ok');
    },
    choices: [
      { text: '"Mal som toho príliš veľa, nezostal mi čas." [REP Lucia −1]', next: 'sc_003_lucia_rozvrh' },
      { text: '"Vieš že som musel zostať inkognito, je to proste súčasťou práce." [neutrálne]',                next: 'sc_003_lucia_baku' },
      { text: '"Vedela si, že sa vrátim. Nikdy som nezabudol na Plzeň čo čapuješ :)" [REP Lucia +1]',    next: 'sc_003_lucia_vedela', xp: 5 },
      { text: '(Nič nehovor. Len si sadni.) [SAN +2]',        next: 'sc_003_lucia_mlcanie', san: 2 },
      { text: '(Prisadni si najskôr k mužovi pri okne menom Meliško', next: 'sc_003b_melisko' },
    ]
  },

  sc_003_lucia_rozvrh: {
    name: 'Miki Bar // Lucia — Rozvrh',
    art: '🐟',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [
      '"Mal som komplikovaný rozvrh."',
      'Lucia sa pozrie na teba. Dlhú sekundu.',
      '"Komplikovaný rozvrh." Opakuje to. "Jasné."',
      'Otočí sa späť k baru. Naleje pohár. Stúčhne ho pred teba.',
      '"Za tú hlúposť platíš sám."',
    ],
    onEnter: function(){ S.flags['lucia_rep_minus'] = true; addLog('Lucia REP −1.', 'warn'); },
    choices: [{ text: 'Počúvať ďalej', next: 'sc_003_lucia_hovor' }]
  },

  sc_003_lucia_baku: {
    name: 'Miki Bar // Lucia — Baku',
    art: '🐟',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [
      '"Baku ma zdržalo."',
      'Lucia kývne. Nie odpúšťa — len zaznamenáva.',
      '"Baku." Odmlčí sa. "Počula som, čo sa tam dialo. V roku 2074."',
      '"Dúfam, že to stálo za to."',
    ],
    onEnter: function(){ addLog('Lucia: neutrálne. Baku — vie o operácii 2074.', 'ok'); },
    choices: [{ text: 'Počúvať ďalej', next: 'sc_003_lucia_hovor' }]
  },

  sc_003_lucia_vedela: {
    name: 'Miki Bar // Lucia — Vedela si',
    art: '🐟',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [
      '"Vedela si, že sa vrátim."',
      '"Ja som vedela. Ty si nevedel."',
      '',
      '// [LOGIKA] Zaujímavé rozlíšenie. Ona naznačuje že tvoj návrat nebol výsledkom rozhodnutia',
      '// ale nevyhnutnosti. Má pravdu? Prečo si sa vlastne vrátil? //',
    ],
    onEnter: function(){ gainXP(5); S.flags['lucia_rep_plus'] = true; addLog('Lucia REP +1. XP +5.', 'ok'); },
    choices: [{ text: 'Počúvať ďalej', next: 'sc_003_lucia_hovor' }]
  },

  sc_003_lucia_mlcanie: {
    name: 'Miki Bar // Lucia — Ticho',
    art: '🐟',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [
      '(Sadneš si. Nič nehovoríš.)',
      'Lucia na teba pozrie. Potom sa ticho otočí a naleje dva poháre.',
      'Jeden stúčhne pred teba. "Aspoň si sa nič hlúpe nevymyslel."',
      '',
      '// [SAN +2] Ticho má niekedy viac zmyslu ako slová. //',
    ],
    onEnter: function(){ S.san = Math.min(100, S.san + 2); Renderer.updateStats(); addLog('Lucia: SAN +2.', 'ok'); },
    choices: [{ text: 'Počúvať ďalej', next: 'sc_003_lucia_hovor' }]
  },

  sc_003_lucia_hovor: {
    name: 'Miki Bar // Lucia — Mesto a Bane Corp.',
    art: '🐟',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [
      '"Tri roky som tu za týmto barom počúvala ľudí. Vieš čo som sa naučila?"',
      '"Každý má svoju verziu mesta."',
      '"Starý Miro ti povie, že Prievidza umrela keď zatvorili bane."',
      '"Mladí čo chodia sem v piatok ti povedia, že Prievidza nikdy nežila."',
      '"A Tomáš z M.E.C. — ten čo chodí sem v utorok večer, myslí si že ho nepoznám —',
      ' ten ti povie, že Prievidza je investičná príležitosť."',
      '"Nikto z nich nemá celkom pravdu. A nikto celkom klame."',
      '',
      '"Ty? Čo hovoríš ty?"',
      '"Ja hovorím, že som tu. Čo o mne hovorí viac ako chcem."',
      '',
      '"Ľudia v bytoch M.E.C. majú internet len cez Bane Corp. infraštruktúru."',
      '"Každý paket, každá správa, každý hovor ide cez ich servery."',
      '"Môj sused Ján — šesťdesiatdva, chodí hlasovať každé voľby."',
      '"V marci hlasoval za stranu, ktorej nikdy neveril. Bol z toho celý pomätený."',
      '"Nechcel som," hovoril. "Prišiel som k urne a ruka išla sama."',
      '',
      '// [LOGIKA] 5G infraštruktúra. Bane Corp. siete. Biomodifikácia neurálnych receptorov',
      '// cez mikrovlnné frekvencie je teoreticky možná od roku 2041. Teoreticky. //',
      '// [EMPATIA] Ona ti to hovorí pretože sa bojí. A pretože nemá koho iného kto by ju počúval. //',
    ],
    onEnter: function(){
      gainXP(15);
      S.flags['lucia_stopa'] = true;
      S.flags['banecorp_siete'] = true;
      addLog('Lucia: Bane Corp. siete = kontrola hlasov. LAZARUS podozrenie.', 'warn');
    },
    choices: [
      { text: 'Prisadnúť k Meliškovi — stôl pri okne', next: 'sc_003b_melisko' },
      { text: 'Opýtať sa Lucie priamo na LAZARUS',      next: 'centrum_lazarus_lucia' },
      { text: 'Odísť za Druidom',                       next: 'sc_004_druid' },
    ]
  },

  // ╔═══════════════════════════════════════════════════════════════╗
  // ║  // SCÉNA 003b // MELIŠKO — Stôl pri okne · 00:31           ║
  // ╚═══════════════════════════════════════════════════════════════╝
  sc_003b_melisko: {
    name: 'Miki Bar // Ladislav Meliško · 00:31',
    art: '☕',
    npcName: 'Ladislav Meliško',
    text: [
      'Pri okne sedí muž. Starší, pohľad upretý do pohára.',
      'Lucia ťa pozrie, kývne hlavou smerom k nemu.',
      '"Meliško. Sedí tu od deviatej. Piatu kávičku si objednáva, ale nepije.",',
      '',
      'Pristúpiš. Muž sa pozrie na teba.',
      'Oči má jasné — prekvapivo jasné na niekoho kto sedí v bare o polnoci.',
      '"Sadni si, sadni si. Stojaci muž je nepokojný muž. A nepokojný muž je stratený muž."',
    ],
    onEnter: function(){
      gainXP(5);
      S.flags['melisko_kontakt'] = true;
      addLog('Ladislav Meliško — kontakt v Miki bare.', 'ok');
    },
    choices: [
      { text: '"Čo tu robíte takto neskoro?" [Info +]',   next: 'sc_003b_melisko_info' },
      { text: '"Poznám vás odtiaľsi." [neutrálne]',        next: 'sc_003b_melisko_poznam' },
      { text: '"Potrebujete niečo?" [Quest unlock]',       next: 'sc_003b_melisko_cibula', xp: 10 },
      { text: '(Počúvaj. Nič nehovor.) [SAN +1 · XP +10]',next: 'sc_003b_melisko_pocuvaj', xp: 10, san: 1 },
    ]
  },

  sc_003b_melisko_info: {
    name: 'Miki Bar // Meliško — Prečo tu',
    art: '☕',
    npcName: 'Ladislav Meliško',
    text: [
      '"Čo tu robím? Čakám."',
      '"Na čo?" "Na niečo čo neviem pomenovať. Ale cítim, že príde."',
      '"Päťdesiat rokov som žil v tomto meste. Viem keď sa niečo chystá."',
    ],
    onEnter: function(){ gainXP(5); addLog('Meliško: niečo sa chystá.', 'ok'); },
    choices: [{ text: 'Pokračovať', next: 'sc_003b_melisko_cibula' }]
  },

  sc_003b_melisko_poznam: {
    name: 'Miki Bar // Meliško — Pamäť',
    art: '☕',
    npcName: 'Ladislav Meliško',
    text: [
      '"Poznáš ma?" Usmieje sa.',
      '"Prievidza je malé mesto. Všetci sa tu poznali — pred."',
      '"Teraz ľudia chodia vedľa seba a dívajú sa do zeme."',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [{ text: 'Pokračovať', next: 'sc_003b_melisko_cibula' }]
  },

  sc_003b_melisko_pocuvaj: {
    name: 'Miki Bar // Meliško — Ticho',
    art: '☕',
    npcName: 'Ladislav Meliško',
    text: [
      '(Sadneš si. Počúvaš.)',
      'Meliško chvíľu mlčí. Potom začne hovoriť — nie tebe, skôr sám sebe.',
      '"Cibuľa. Z trhoviska. Tá čo predáva Marta. Bane Corp. veci nič nie sú."',
      '',
      '// [SAN +1] Niekedy stačí len byť prítomný. //',
    ],
    onEnter: function(){ gainXP(10); S.san = Math.min(100, S.san + 1); Renderer.updateStats(); },
    choices: [{ text: 'Pokračovať', next: 'sc_003b_melisko_cibula' }]
  },

  // ── Quest: CIBUĽA ───────────────────────────────────────────────────
  sc_003b_melisko_cibula: {
    name: 'Miki Bar // Meliško — Cibuľa',
    art: '☕',
    npcName: 'Ladislav Meliško',
    text: [
      '"Potrebujem cibuľu."',
      '',
      '// [LOGIKA] Cibuľu. O polnoci. V bare. Buď je to metafora, alebo je to presne to čo to je. //',
      '',
      '"Nie hocijakú. Tú starú, z trhoviska. Tá čo predáva Marta — vedľa hodinára, každú stredu."',
      '"Bane Corp. začali pred rokom pestovať nejaké hybridné veci, geneticky."',
      '"Cibuľa má byť cibuľa, rozumiete? Nie nejaký korporátny experiment."',
      '',
      '"Trhovisko je zatvorené. Marta odišla."',
      '"Ale niekde tá cibuľa musí byť. Všetko čo bolo — niekde je."',
      '',
      '// [EMPATIA] Nehovorí o cibuli. Alebo hovorí o cibuli a zároveň o niečom inom. //',
      '// [TRAS] Všetko čo bolo — niekde je. Nie poetická pravda — doslovná. //',
      '',
      '// 📋 Quest: CIBUĽA — Nájdi Martinu cibuľu · ▲ XP +10 //',
    ],
    onEnter: function(){
      gainXP(10);
      S.flags['quest_cibula'] = true;
      addLog('Quest: CIBUĽA — Nájdi Martinu cibuľu pre Meliška.', 'ok');
    },
    choices: [
      { text: 'Sledovať scénu — Kubo (UFO incident)', next: 'sc_003c_kubo' },
      { text: 'Odísť za Druidom',                     next: 'sc_004_druid' },
    ]
  },

  // ╔═══════════════════════════════════════════════════════════════╗
  // ║  // SCÉNA 003c // KUBO — UFO Incident · 00:48               ║
  // ╚═══════════════════════════════════════════════════════════════╝
  sc_003c_kubo: {
    name: 'Miki Bar // Kubo — UFO Incident · 00:48',
    art: '🛸',
    npcName: 'Kubo (~22)',
    text: [
      'Od stola v rohu sa ozve jeden z mladých.',
      '"Počujete? Vy starší — boli ste vonku v utorok v noci?"',
      '',
      '"Bolo nás päť, išli sme od Jantaru domov, asi o druhej."',
      '"A nad Cigelkou — niečo preletelo. Ticho. Žiadny zvuk."',
      '"Svetlá, ale nie ako lietadlo. Tri svetlá, trojuholník, pomalé."',
      '"Zastavili sme auto na tej ceste pri Lesoparku."',
      '"Oproti nám zastavilo auto. Dvaja chlapi. Spýtali sa nás kde je Lesopark."',
      '',
      '// [VNEM] Ruka mu jemne trasie. Nie od alkoholu — ruky opitých sa trasú inak.',
      '// Toto je adrenalín. Spätný adrenalín, hodiny starý. On naozaj niečo videl. //',
      '',
      '// [TRAS] Trojuholníkové svetlá. Ticho. Lesopark. Niečo v tebe — hlboko, pod logikou —',
      '// vie že toto je dôležité. Nevie prečo. Zatiaľ. //',
      '',
      '"Ich auto nemalo poznávaciu značku. Rovnako ako to biele pred barom."',
      'Všetci sa pozrú na dvere. Biele auto je preč.',
      '',
      '// [DAEDALUS — PRÍJEM 01:52] Agent. Vitám ťa späť v operačnej oblasti.',
      '// Incident utorok 02:14 — zaregistrovaný. Klasifikácia: otvorená.',
      '// Neidentifikované vzdušné objekty nad Prievidzou — tri nezávislé zdroje.',
      '// Súvislosť s projektom LAZARUS: pravdepodobná.',
      '// Priorita A: Bánovce nad Bebravou. 5G vysielač, sektor 7.',
      '// Odchod odporúčaný pred svitaním. //',
      '',
      '// 📋 Quest: LAZARUS — Bánovce, Sektor 7 · ▼ HLAD −8 · ▼ SAN −3 //',
    ],
    onEnter: function(){
      gainXP(20);
      S.flags['ufo_incident'] = true;
      S.flags['banovce_sektor7'] = true;
      S.hunger = Math.max(0, S.hunger - 8);
      S.san    = Math.max(0, S.san - 3);
      S.flags['daedalus_01'] = true;
      activateOp('op-5g');
      activateOp('op-lazarus');
      addLog('UFO incident: trojuholník nad Cigelkou. Bánovce Sektor 7 priorita A.', 'warn');
      addLog('HLAD −8 · SAN −3 (informačné preťaženie)', 'warn');
      Renderer.updateStats();
    },
    choices: [
      { text: 'Ísť za Druidom — Za Korzo OC', next: 'sc_004_druid' },
      { text: 'Opýtať sa Lucie viac o Bane Corp.', next: 'centrum_lazarus_lucia' },
    ]
  },

  // ╔═══════════════════════════════════════════════════════════════╗
  // ║  // SCÉNA 004 // DRUID — TUTORIÁL · Za Korzo OC · 01:14     ║
  // ╚═══════════════════════════════════════════════════════════════╝
  sc_004_druid: {
    name: 'Za Korzo OC // Druid · 01:14',
    art: '🔥',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    text: [
      'Druid sedí pri ohni v plechovke.',
      'V noci z roku 2077 vyzerá ako omyl — ako objekt z inej éry.',
      'Mesto okolo neho bliká a bzučí a sleduje. On horí v plechovke a číta papierovú mapu.',
      '',
      'Keď si sadneš, povie bez toho aby sa pozrel:',
      '"Tri roky. Kaukaz. Vrátil si sa pretože si musel, nie pretože si chcel."',
      '"Viem to pretože ľudia čo sa vracajú pretože chcú — tí idú rovno domov. Ty si tu."',
      '"Tak začneme."',
      '',
      'Vytasí prístroj — kompas s tromi ručičkami — a položí ho na zem medzi vás.',
    ],
    onEnter: function(){
      gainXP(5);
      S.flags['druid_prvykontakt'] = true;
      addLog('Druid: prvý kontakt. Tutoriál.', 'ok');
      activateOp('op-druid');
    },
    choices: [
      { text: 'Počúvať mechaniky (HP / SAN / Hlad)', next: 'sc_004_druid_mech' },
      { text: '"Ktorý nástroj odporúčaš?"',            next: 'sc_004_druid_nastroj' },
      { text: '"Tunely pod Bojnicami. Čo je tam?" [XP +10]', next: 'sc_004_druid_tunely', xp: 10 },
      { text: '"Kto si ty?" [XP +20 · Info ++]',       next: 'sc_004_druid_kto', xp: 20 },
      { text: '(Počúvaj. Nič nehovor.) [SAN +3]',      next: 'sc_004_druid_ticho', san: 3 },
    ]
  },

  sc_004_druid_mech: {
    name: 'Za Korzo OC // Druid — HP · SAN · Hlad',
    art: '🔥',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    text: [
      '// [TELO — HP] //',
      '"Telo je nástroj. Nie chrám, nie väzenie. Nástroje sa brúsia, opravujú, skladajú keď ich zanedbáš."',
      '"Gym na Zagorskej. Terasy pri Bojniciach. Spánok. Jedlo."',
      '// HP max 100. Klesa bojom, hladom, nespánkom. Rastie odpočinkom, jedlom, lekárom. //',
      '',
      '// [MYSEĽ — SANITA] //',
      '"V tomto meste existujú informácie ktoré mozog nevie spracovať bez straty."',
      '"Čím hlbšie pôjdeš — do tunelov, do sietí, do histórie — tým viac budeš vidieť veci ktoré nie sú pre ľudské oči."',
      '"Sanita nie je slabosť. Je to zásobník. Keď je prázdny, prestaneš rozlišovať čo je skutočné."',
      '// SAN max 100. Klesa odhaleniami, izoláciou, Mentátom. Rastie rozhovorom, prírodou, záhradou. //',
      '',
      '// [HLAD] //',
      '"Hladný agent je pomalý agent. Hladný agent robí chyby. Základňa má sporák. Použi ho."',
      '// HLAD max 100. Pri 30 a menej: −2 ku každej akcii. Pri 0: strácaš HP každú hodinu. //',
      '',
      '// ▼ SAN −2 (príliš veľa informácií naraz) //',
    ],
    onEnter: function(){
      gainXP(10);
      S.san = Math.max(0, S.san - 2);
      Renderer.updateStats();
      addLog('Druid: HP/SAN/HLAD mechaniky. SAN −2.', 'ok');
    },
    choices: [
      { text: '"Kto si ty?" [XP +20]',           next: 'sc_004_druid_kto', xp: 20 },
      { text: '"Tunely pod Bojnicami?" [XP +10]', next: 'sc_004_druid_tunely', xp: 10 },
      { text: 'Počúvať o nástrojoch',             next: 'sc_004_druid_nastroj' },
    ]
  },

  sc_004_druid_nastroj: {
    name: 'Za Korzo OC // Druid — Nástroje',
    art: '🔥',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    text: [
      '"Každý problém v Prievidzi má tri riešenia."',
      '"Sila — priamy, bolestivý, efektívny, predvídateľný."',
      '"Ohybnosť — neviditeľná, adaptívna, ťažko sledovateľná."',
      '"Hacking — vidíš mestá pod mestom, siete pod ulicami. Ale siete majú pamäť."',
      '"LAZARUS žije v sieti. Ak ho chceš vidieť, musíš vedieť kde pozerať."',
    ],
    onEnter: function(){ gainXP(10); addLog('Druid: SIL/OHY/HCK — tri cesty.', 'ok'); },
    choices: [
      { text: '"Kto si ty?" [XP +20]', next: 'sc_004_druid_kto', xp: 20 },
    ]
  },

  sc_004_druid_tunely: {
    name: 'Za Korzo OC // Druid — Tunely',
    art: '🔥',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    text: [
      '"Tunely pod Bojnicami. Sú staré. Staršie ako Bane Corp., staršie ako ja."',
      '"Teraz — niečo tam je. Nie ľudia. Server farm. Alebo to čo z nej zostalo."',
      '"LAZARUS bol zapnutý v roku 2061. Tam. Pod Bojnicami."',
      '"Mysleli sme že je to zálohovací systém. Nebol."',
      '',
      '// [LOGIKA] Server farm pod Bojnicami. Rok 2061. Šestnásť rokov.',
      '// Čo vie o systéme ktorý hľadá telo? //',
    ],
    onEnter: function(){
      gainXP(10);
      S.flags['tunely_bojnice_info'] = true;
      S.flags['lazarus_2061'] = true;
      addLog('Druid: LAZARUS zapnutý 2061, Bojnice. XP +10.', 'warn');
    },
    choices: [
      { text: '"Kto si ty?" [XP +20]', next: 'sc_004_druid_kto', xp: 20 },
    ]
  },

  sc_004_druid_ticho: {
    name: 'Za Korzo OC // Ticho pri ohni',
    art: '🔥',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    text: [
      '(Sadneš si. Počúvaš. Oheň praská v plechovke.)',
      'Druid ťa odmeria. Kývne pomaly. "Dobrý začiatok."',
      'Oheň. Tichá ulica. Vzdialený bzukot Alzaboxu.',
      '',
      '// [SAN +3] //',
    ],
    onEnter: function(){
      S.san = Math.min(100, S.san + 3);
      Renderer.updateStats();
      addLog('Ticho pri ohni. SAN +3.', 'ok');
    },
    choices: [{ text: 'Pokračovať v rozhovore', next: 'sc_004_druid_kto' }]
  },

  sc_004_druid_kto: {
    name: 'Za Korzo OC // Druid — Kto si ty',
    art: '🔥',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    text: [
      '"Kto si ty?"',
      '"Bol som baník. Potom inžinier. Potom niekto koho M.E.C. nechcel nechať existovať."',
      '"A potom som prestal byť niekto koho môžu nájsť."',
      '',
      '"Bol som pri tom keď zapli LAZARUS. Rok 2061."',
      '"Server farm pod Bojnicami. Mysleli sme že je to zálohovací systém. Nebol."',
      '',
      '"Odporúčam aby si sa naučil hackovat."',
      '"Nie pretože je to najefektívnejšie."',
      '"Ale pretože LAZARUS žije v sieti a ak ho chceš vidieť, musíš vedieť kde pozerať."',
      '',
      '// [LOGIKA] Druid bol pri zapnutí LAZARU. Rok 2061. Šestnásť rokov. //',
      '// [VÔĽA] Môžeš odísť. Máš dosť informácií. Ale niečo ťa tu drží — zvedavosť.',
      '// A to je možno najnebezpečnejšia vec v tomto meste. //',
      '',
      'Druid vstane. Zbalí mapu. Oheň nechá horieť.',
      'Za ním zostane len plameň v plechovke a hologramový odraz Alzaboxu v kaluži pätnásť metrov ďalej.',
      '',
      '// [ALZABOX] NOVÝ BYT. NOVÝ ŽIVOT. //',
      '// [TRAS] Tri veci v jednom odraze. Ty. Oheň starého muža. Reklama korporácie.',
      '// Toto je mesto. Toto je situácia. Vyber si čo z toho si. //',
      '',
      '// ▲ XP +20 · SAN +3 · Druid — kontakt pridaný · LAZARUS: zapnutý 2061, Bojnice //',
    ],
    onEnter: function(){
      gainXP(20);
      S.san = Math.min(100, S.san + 3);
      S.flags['druid_identita'] = true;
      S.flags['lazarus_2061'] = true;
      addLog('Druid: bol pri zapnutí LAZARU 2061. XP +20, SAN +3.', 'ok');
      Renderer.updateStats();
    },
    choices: [
      { text: 'Pokračovať na poštu za Druidom (ráno)',  next: 'posta' },
      { text: 'Ísť priamo do Bánoviec — Sektor 7',
        next: 'banovce_cesta',
        cond: function(){ return !!S.flags['banovce_sektor7']; },
        condFail: 'Najprv zisti kde je Sektor 7.' },
      { text: 'Ísť do základne — odpočinúť',           next: 'domov' },
    ]
  },


  // ── START ──────────────────────────────────────────────────────────
  start: {
    name: 'Prievidza // Centrum',
    art: '🏙️',
    text: [
      'Prievidza, 03:47.',
      'Mestské centrum. Tichá ulica. Kde sú všetci?',
      '',
      'Na tvojom telefóne: správa bez odosielateľa.',
      '"LAZARUS je aktívny. Máš do štyroch hodín."',
      '"— Druid"',
      '',
      '// Druid. Tvoj kontakt. Čo presne je LAZARUS? //',
      '',
      '// 💡 TIP: Otvor MAPU pre rýchlu navigáciu po meste //',
    ],
    choices: [
      { text:'⌖ [MAPA] Otvoriť mapu mesta',
        action: function(){ if (typeof CityMap !== 'undefined') CityMap.open(); },
        next:'start' },
      { text:'[A] Ísť na poštu za Druidom',     next:'posta' },
      { text:'[B] Preskúmať centrum',            next:'centrum_noc' },
      { text:'[C] Ísť do Jantaru',              next:'loc_jantar' },
      { text:'[D] Ísť na FRI',                  next:'loc_fri' },
      { text:'[E] Ísť na Nám. slobody',         next:'loc_namestie' },
    ]
  },

  centrum_noc: {
    name: 'Centrum // Prievidza 03:47',
    art: '🌃',
    text: [
      'Hlavná ulica. Tristo metrov betónu a neonov, ktoré nikto nezapol.',
      'Alzabox pri každom vchode — niektoré blikajú, niektoré sú rozbité, jeden má na skle',
      'čierny sprej: "VIDÍME ŤA."',
      '',
      'Na plote kostola — čerstvý nápis, ešte mokrý:',
      '"PROJEKT 5G = BOJ PROTI SLOBODE"',
      'Vedľa, iná ruka, iná farba:',
      '"LAZARUS NÁS POČUJE. ALOBAL NEPOMÁHA."',
      '',
      '// [VNEM] Dvaja nápisy, dve ruky, dve správy. Jeden z pisateľov vedel viac ako druhý.',
      '// Alebo obaja vedeli rovnako málo — a to je horšie. //',
      '',
      'Fontána v strede námestia. Nefunguje — voda zamrznutá do šedého prstencu.',
      'Pri nej stojí žena. Čierna bunda, cigareta, pohľad upretý niekam za tvoje rameno.',
      'Keď sa pozrie na teba, nie je to pohľad cudzinca. Je to pohľad niekoho, kto čakal.',
      '',
      '"Nočná smena?" Hlas tichý. "Alebo niečo iné?"',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text:'[A] „Čo sa tu deje?"',      next:'centrum_lucia' },
      { text:'[B] Ignorovať — ísť na poštu', next:'posta' },
      { text:'[C] Preskúmať nápisy',       next:'centrum_napisy' },
    ]
  },

  centrum_lucia: {
    name: 'Centrum // Lucia Vaňová',
    npcName: 'Lucia Vaňová',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '👩',
    text: [
      '"Čo sa deje?" Zasmeje sa. Nie veselo — tichý zvuk bez radosti.',
      '"Štandardná Prievidza. Ľudia niečo cítia, ale nevedia čo."',
      '"Volám sa Lucia. Novinárka — bola som novinárka."',
      '"Teraz som tu. To je všetko čo mám."',
      '',
      'Zahodí cigaretu. Na zápästí vidíš jazvu. Čerstvú.',
      'Chirurgickú. Nevyzerá ako nehoda.',
      '',
      '"Zaujímavé, nie?" Všimla si, že pozeráš.',
      '"Dajú ti to bez pýtania. Vraj monitoring zdravia. Vraj dobrovoľné."',
      '',
      '"Nebolo."',
      '',
      '// [VNEM] Jazva je stará asi päť dní. Nie sedemdesiatdva hodín, nie dva týždne.',
      '// Päť dní — to je deň po tom, čo Druid poslal správu. Zhoda? //',
    ],
    onEnter: function(){ gainXP(15); S.flags['lucia_jazva']=true; addLog('Lucia Vaňová: implantát bez súhlasu.','ok'); },
    choices: [
      { text:'[A] „Čo vieš o LAZARUS?"',  next:'centrum_lazarus_lucia' },
      { text:'[B] „Kto ti to urobil?"',   next:'centrum_lucia_jazva' },
      { text:'[C] Ísť na poštu',          next:'posta' },
    ]
  },

  centrum_lazarus_lucia: {
    name: 'Centrum // Lucia o LAZARUS',
    npcName: 'Lucia Vaňová',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '👩',
    text: [
      '"LAZARUS." Zastaví sa. Dlhá sekunda.',
      '"Písala som o tom. Mesiac dozadu. Redakcia článok zabila bez vysvetlenia."',
      '"Šéfredaktor povedal: nedokázaná konšpirácia, nebudeme sa zosmiešňovať."',
      '"Na druhý deň som dostala predvolanie k lekárovi. Povinné. Z mesta, nie od môjho doktora."',
      '"Keď som sa vrátila, mala som toto."',
      '',
      'Ukáže zápästie.',
      '',
      '"LAZARUS nie je projekt. Je to systém. Frekvencie, biológia, poddajnosť."',
      '"Nie smrť — niečo subtílnejšie. Ľudia prestanú klásť otázky."',
      '"Alebo začnú hlasovať pre strany, ktorým nikdy neverili."',
      '',
      '"O štvrtej ráno sa spustí druhá fáza. Potom je neskoro."',
      '',
      '// [LOGIKA] Koreluje s tým čo hovoril Druid. Nezávislé zdroje, rovnaký záver.',
      '// [EMPATIA] Stratila prácu, dostala implantát bez súhlasu. A stále tu stojí a hovorí ti to.',
      '// To nie je strach. To je rozhodnutie. //',
    ],
    onEnter: function(){ gainXP(20); S.flags['lucia_stopa']=true; addLog('Lucia: LAZARUS = systém frekvenčnej kontroly. Fáza 2 o 4:00.','warn'); activateOp('op-lazarus'); },
    choices: [
      { text:'[A] „Pomôž mi zastaviť to."',   next:'centrum_lucia_pomoc' },
      { text:'[B] Ísť za Druidom na poštu',   next:'posta' },
    ]
  },

  centrum_lucia_jazva: {
    name: 'Centrum // Jazva',
    npcName: 'Lucia Vaňová',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '👩',
    text: [
      '"Kto?" Pozrie na jazvu.',
      '"Doktor Mináč. Klinika pri FRI. Ale on len vykonáva — rozkazy dostáva od niekoho iného."',
      '"Pavel Oravec. FRI, laboratórium B7."',
      '',
      'Odmlčí sa. Pozrie na fontánu.',
      '"Viem, že to znie ako konšpirácia. Sama som si to hovorila — kým som sedela v čakárni',
      ' a pozerala na plakát: DOBROVOĽNÝ MONITORING = ZDRAVŠIA KOMUNITA."',
      '"Podpísala som. Lebo čo iné si robí človek v čakárni?"',
      '',
      '"Konšpirácie majú jeden problém: niekedy sú pravda."',
      '',
      '// [VNEM] Oravec. To meno si počul na FRI bulletine. Etická komisia pozastavená. //',
    ],
    onEnter: function(){ gainXP(10); S.flags['oravec_stopa']=true; addLog('Dr. Oravec na FRI — LAZARUS velenie.','ok'); },
    choices: [
      { text:'[A] Ísť na FRI',         next:'loc_fri' },
      { text:'[B] Ísť za Druidom',     next:'posta' },
    ]
  },

  centrum_lucia_pomoc: {
    name: 'Centrum // Lucia — Spojenectvo',
    npcName: 'Lucia Vaňová',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '👩',
    text: [
      'Lucia sa zastaví. Opakuje slovo ako by ho testovala.',
      '"Zastaviť."',
      '',
      '"Vtáčnik. To je miesto. Hlavný uzol siete — ak ho prerušíš fyzicky, fáza 2 sa nespustí."',
      '"Vstup cez Bojnické jaskyne. Stredný koridor."',
      '"Pozor na pravý — je strážený."',
      '',
      'Vytiahne starú turistickú mapu, poprepisovanú ceruzkou.',
      'Podá ti ju.',
      '"Druid vie cestu. A vie o bunkri pod uzlom."',
      '"Potrebuješ jeho. A baterku."',
      '',
      '// [EMPATIA] Dáva ti mapu. To je všetko čo má — papier a informácia.',
      '// [LOGIKA] Ak ťa zatkne M.E.C., Lucia je kompromitovaná. Vie o tom. //',
    ],
    onEnter: function(){ gainXP(25); S.flags['vtacnik_info']=true; addLog('Lucia: Vtáčnik = hlavný uzol. Jaskyňa = vstup.','ok'); activateOp('op-jaskyne'); },
    choices: [
      { text:'[A] Ísť za Druidom na poštu',   next:'posta' },
      { text:'[B] Ísť priamo k jaskyniam',    next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky nepôjdeš do jaskyne.' },
    ]
  },

  centrum_napisy: {
    name: 'Centrum // Nápisy na múre',
    art: '🖊️',
    text: [
      'Väčšina sú stariny — anarchistické symboly, politické heslá, meno niekoho komu sa niekto sťažuje.',
      'Obvyklý folklór múrov.',
      '',
      'Ale jeden nápis je iný.',
      'Čerstvý, presný, nie sprej ale permanentný fix:',
      '"LAZARUS NODE 7 = 48.7702°N 18.6196°E"',
      '"VTÁČNIK. SIGMA CORE. NEUTRALIZUJ."',
      '',
      'Pod tým, ceruzkou, tichším písmom:',
      '"— A.D."',
      '',
      '// [VNEM] GPS koordináty sú presné na meter. Kto toto napísal vedel kde stojí uzol.',
      '// [LOGIKA] A.D. — Agent Delta? Rovnaká iniciála ako v zápisníku na FRI.',
      '// Toto nie je varovanie pre náhodných chodcov. Toto je správa. Pre niekoho konkrétneho.',
      '// Pre teba, možno. //',
    ],
    onEnter: function(){ gainXP(15); S.flags['centrum_gps']=true; addLog('GPS koordináty Vtáčnik Uzol 7: 48.7702°N 18.6196°E','ok'); activateOp('op-5g'); },
    choices: [
      { text:'[A] Ísť na poštu za Druidom', next:'posta' },
      { text:'[B] Ísť na FRI',             next:'loc_fri' },
      { text:'[C] Ísť k jaskyniam',        next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky nepôjdeš.' },
    ]
  },

  // ── POŠTA ──────────────────────────────────────────────────────────
  posta: {
    name: 'Hlavná Pošta // Dead Drop',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    art: '📮',
    text: [
      'Pošta. Zatvorená od jedenástej. Ale dvierka na skok otvorené — niekto zanechal priečku.',
      '',
      'Vo vnútri tma. Len malá lampa za pultom.',
      'Za ňou: Druid. Sedí na stoličke zamestnanca, ako by tu pracoval tridsať rokov.',
      '',
      '"Myslel som, že neprídeš." Niet v tom výčitke. Len konštatovanie.',
      '"Máme menej času ako som čakal."',
      '',
      'Rozloží na pult papier — ručne písaný, siahajúci na obe strany.',
      '"LAZARUS. Protokol rezonančnej synchronizácie. Aktivácia o štvrtej ráno.",',
      '"Primárny uzol: Vtáčnik nad Bánovcami. Sektor 7."',
      '"Ak ho nezastavíme — celé mesto bude pod vplyvom do svitania."',
      '',
      '// [VNEM] Za jeho chrbtom: rady poštových priečinkov. Jeden z nich, druhý zľava, prvý rad —',
      '// má dvierka pootvorené. Vo vnútri kus obálky. Biela. //',
    ],
    onEnter: function(){ gainXP(20); activateOp('op-druid'); addLog('Druid: LAZARUS o 4:00. Vtáčnik = primárny uzol.','ok'); },
    choices: [
      { text:'[A] „Čo presne robí LAZARUS?"',           next:'posta_viac' },
      { text:'[B] „Ukáž mi mapu jaskýň."',              next:'posta_mapa' },
      { text:'[C] „Mám spis OMEGA — pomôž mi s bunkrom."', next:'posta_bunker',
        cond:function(){ return hasItem('spis'); }, condFail:'Nemáš spis OMEGA.' },
      { text:'[D] Ísť priamo k jaskyniam',              next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },

  posta_viac: {
    name: 'Pošta // Druid vysvetľuje',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    art: '📮',
    text: [
      'Druid si sadne. Skríži ruky.',
      '"60 gigahertzové milimetrové vlny. Viete čo robia s kyslíkom v krvi?"',
      '"Nie smrť — to by bolo jednoduché. Niečo subtílnejšie."',
      '"Biologická poddajnosť. Schopnosť klásť otázky — mierne, nepostrehnuteľne otupená.",',
      '"Ako keď ľudia prestanú klásť otázky. Nie z donútenia. Len... prestanú."',
      '',
      '"Znie to absurdne." Pozrie na teba priamo. "Aj mne znelo."',
      '"Kým Oravec mi to nepotvrdil — pred tým, ako zmizol."',
      '"A kým Lucia Vaňová mi neukázala jazvu na zápästí."',
      '',
      '"Uzol 7 musíme zastaviť. Fyzicky — alebo cez sieť."',
      '"Oboje má cenu. Oboje má riziko."',
      '',
      '// [LOGIKA] Dva nezávislé zdroje — Oravec a Lucia. Druid bol pri zapnutí LAZARU.',
      '// Toto nie je konšpirácia. Toto je dokumentovaná operácia. //',
    ],
    onEnter: function(){ gainXP(15); addLog('Druid potvrdzuje: LAZARUS = biologická poddajnosť.','warn'); },
    choices: [
      { text:'[A] „Ukaž mi mapu jaskýň."',    next:'posta_mapa' },
      { text:'[B] Ísť na FRI za Oravcom',     next:'loc_fri' },
      { text:'[C] Priamo k jaskyniam',        next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },

  posta_mapa: {
    name: 'Pošta // Mapa jaskýň',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    art: '🗺️',
    text: [
      'Druid vytiahne z tašky zloženú mapu — starú, ale s ceruzkovými záznamami, ktoré sú čerstvé.',
      'Rozloží ju na pult.',
      '',
      '"Bojnické jaskyne. Tri koridory od vstupu."',
      '"Ľavý vedie k podzemnej rieke. Krásne. Slepá ulička."',
      '"Pravý — strážený. Dvaja, možno traja. Striedanie každé štyri hodiny."',
      '"Stredný — to je cesta."',
      '',
      '"Uzol je v hĺbke štyridsať metrov. Pod ním bunker."',
      '"Na bunkri potrebuješ keycard a spis OMEGA pre overenie totožnosti.",',
      '"Bez oboch ťa systém odmietne. Bez šance."',
      '',
      'Pozrie na teba.',
      '"Baterku máš?"',
    ],
    onEnter: function(){ gainXP(20); S.flags['mapa_jaskyn']=true; addLog('Mapa jaskýň: stredný koridor k Uzlu 7.','ok'); activateOp('op-jaskyne'); activateOp('op-lazarus'); },
    choices: [
      { text:'[A] Ísť do jaskýň (mám baterku)',    next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Kúp baterku v obchode.' },
      { text:'[B] Ísť kúpiť baterku (Obchod)',     next:'start', action:'openShop' },
      { text:'[C] Ísť na FRI za keycardom',        next:'loc_fri' },
    ]
  },

  posta_bunker: {
    name: 'Pošta // Druid o bunkri',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    art: '📮',
    text: [
      'Druid si vezme dokumenty. Číta pomaly. Obráti jednu stranu, potom druhú.',
      '"Spis OMEGA." Odloží ich. "Agent Delta bol dôkladný."',
      '"Tohto som sa bál nájsť. A zároveň dúfal."',
      '',
      '"S týmto a s keycardou — bunker je otvorený."',
      '"Koordinátor bude vo vnútri. Musíš ho presvedčiť alebo zastaviť."',
      '"Ak vieš kód do terminálu, môžeš nasadiť vírus priamo do LAZARUS siete."',
      '"Systém sa zablokuje. Fáza 2 sa nespustí."',
      '"Ale terminál vyžaduje HCK 30 alebo viac. Pod tým — len fyzická cesta."',
      '',
      '// [LOGIKA] Dve možnosti, jeden cieľ. Presvedčiť koordinátora = riskantné, neisté.',
      '// Vírus = technicky náročné, ale čisté. Fyzická konfrontácia = rýchle, nevratné.',
      '// Čo si ty za agenta? Teraz sa to ukáže. //',
    ],
    onEnter: function(){ gainXP(20); S.flags['druid_bunker']=true; addLog('Druid: Bunker = spis + keycard + HCK 30.','ok'); },
    choices: [
      { text:'[A] Ísť do bunkra',    next:'bunker',
        cond:function(){ return hasItem('keycard'); }, condFail:'Chýba keycard.' },
      { text:'[B] Ísť na FRI za keycardom', next:'loc_fri' },
      { text:'[C] Ísť do jaskýň',   next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },

  posta_spis: {
    name: 'Pošta // Spis OMEGA',
    npcName: 'Druid',
    npcImg:  'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/druid.png',
    art: '📮',
    text: [
      'Za pultom: obálka s tvojím menom. Anonymná.',
      '',
      'Vo vnútri: dokumenty. Hustý text. Technické výkresy.',
      '"PROJEKT LAZARUS — FÁZA 2 — KOORDINÁTOR: [REDACTED]"',
      '"PRIMÁRNY UZOL: VTÁČNIK. AKTIVÁCIA: 04:00."',
      '"PRÍSTUPOVÝ KĽÚČ: OMEGA-7-DELTA"',
      '',
      '// Spis OMEGA. Toto je dôkaz. //',
    ],
    onEnter: function(){ addItem('spis'); gainXP(20); activateOp('op-lazarus'); addLog('Spis OMEGA získaný! Dôkaz o LAZARUS.','ok'); showNotif('📁 Spis OMEGA — plán LAZARUS!'); },
    choices: [
      { text:'[A] Ísť za Druidom',   next:'posta' },
      { text:'[B] Ísť na FRI',       next:'loc_fri' },
    ]
  },

  // ── JASKYNE ──────────────────────────────────────────────────────
  jaskyne_vstup: {
    name: 'Bojnické Jaskyne // Vstup',
    art: '🕳️',
    text: [
      'Vstup do jaskyne je nenápadný — drevená doska, starý rebrík dole, turistická cedula',
      'z roku 2043 s vyblednutým textom: BOJNICKÉ JASKYNE — TURISTICKÁ TRASA.',
      'Turistická trasa nikam nevedie. Sezóna skončila v roku 2051, keď M.E.C. odkúpil pozemky.',
      '',
      'Pusti lampu naplno. Teplota klesne o päť stupňov.',
      'Vlhkosť. Vôňa hliny a niečoho starého, minerálneho, akoby zem sama dýcha.',
      '',
      'Tri koridory.',
      '',
      'ĽAVÝ: vzdialený zvuk vody. Plynúcej. Hlbokej.',
      'STREDNÝ: ticho. Nie prázdne ticho — plné ticho. Niečo tam je.',
      'PRAVÝ: svetlo. Žlté, teplé. A hlasy — dvaja, možno traja.',
      '',
      '// Druid hovoril: stredný koridor. Ale on tu nie je. Ty tu si. //',
    ],
    onEnter: function(){ gainXP(15); activateOp('op-jaskyne'); addLog('Vstup do jaskýň.','ok'); },
    choices: [
      { text:'[A] Stredný koridor',    next:'jaskyne_stred' },
      { text:'[B] Ľavý koridor',       next:'jaskyne_hluky' },
      { text:'[C] Pravý koridor',      next:'jaskyne_odpoc' },
    ]
  },

  jaskyne_hluky: {
    name: 'Jaskyne // Ľavý Koridor',
    art: '💧',
    text: [
      'Koridor sa zužuje. Steny mokré, chladné, tmavomodré v svetle baterky.',
      'Zvuk vody zosilňuje — nie kap-kap, ale hukot. Niečo pod nohami, hlboko.',
      '',
      'Po tridsiatich metroch: stena. Slepá ulička.',
      'Rieka vykrojila chodbu, ale pokračovanie spolkla.',
      '',
      'Ale na stene, tesne nad líniou vody, ceruzkou:',
      '"UZOL 7 — STREDNÝ. NIE ĽAVÝ."',
      '"— T.D."',
      '',
      '// [LOGIKA] T.D. — Tomáš Dravecký? Agent Delta zanechal značky.',
      '// Vedel, že niekto príde. Alebo dúfal, že príde. //',
    ],
    onEnter: function(){ gainXP(8); },
    choices: [{ text:'[A] Vrátiť sa a ísť stredným', next:'jaskyne_vstup' }]
  },

  jaskyne_odpoc: {
    name: 'Jaskyne // Pravý Koridor',
    art: '🔦',
    text: [
      'Svetlo je skutočné — kempingová lampa na kamennej rímse.',
      'Pri nej: kempingový stolík, dve stoličky, zvyšky jedla.',
      'A dvaja muži. Nie uniformy — civily, ale niečo v postoji, v pokojnom sledovaní každého vstupu,',
      'hovorí: toto nie je náhoda. Sú tu za určeným účelom.',
      '',
      'Jeden si ťa všimne skôr ako druhý.',
      '"Hej." Nie výkrik — tichý, jasný. Profesionálny.',
      '"Kto si?"',
      '',
      'Máš sekundu. Možno dve.',
    ],
    choices: [
      { text:'[A] Utiecť späť',         next:'jaskyne_vstup' },
      { text:'[B] Zaútočiť (SIL 25+)', next:'jaskyne_boj',
        cond:function(){ return S.str>=25; }, condFail:'Nedostatočná sila (SIL 25+).' },
      { text:'[C] Rýchlo prechádzať',  next:'jaskyne_boj_easy',
        cond:function(){ return S.flex>=20; }, condFail:'Nedostatočná ohybnosť (OHY 20+).' },
    ]
  },

  jaskyne_boj: {
    name: 'Jaskyne // Súboj',
    art: '⚔️',
    text: [
      'Prekvapenie. Jeden úder, rýchly, presný — nie brutalita, efektivita.',
      'Obaja dole za desať sekúnd. Ty tiež dostaneš — lakeť do rebier, bolestivé.',
      '',
      'HP -15. Dýchaš. Funguje to.',
      '',
      'Za nimi: dvierka. Zamknuté oceľovým závorom.',
      'Na stole: tablet. Obrazovka svieti.',
      '"LAZARUS NET MONITOR — UZOL 7 — ONLINE"',
      '"COUNTDOWN: 47:12"',
      '',
      'Čierny panel, zelené písmená. Reálny čas.',
      'Storyboard pred tebou — fáza 2 sa začne za menej ako hodinu.',
      '',
      '// Čas beží. Dvierka sú zamknuté. Stredný koridor čaká. //',
    ],
    onEnter: function(){ S.hp=Math.max(0,S.hp-15); S.str=Math.min(100,S.str+3); Renderer.updateStats(); gainXP(25); addLog('HP -15. Sila +3. Uzol 7 countdown.','warn'); if(S.hp<=0) gameOver('Vyčerpal si sa v boji.'); },
    choices: [
      { text:'[A] Ísť stredným koridorom',  next:'jaskyne_stred' },
      { text:'[B] Hacknúť tablet',          next:'jaskyne_tablet',
        cond:function(){ return S.hackStat>=15; }, condFail:'Nedostatočný hacking (15+).' },
    ]
  },

  jaskyne_boj_easy: {
    name: 'Jaskyne // Rýchly Prechod',
    art: '🤸',
    text: [
      'Prebehnúť! Kľukatý pohyb, využiť tmu.',
      'Jeden strážnik ťa ledva zachytí — len HP -5.',
      '',
      'Za zatáčkou: chodba vedúca hlboko dolu.',
      '"STREDNÝ SEKTOR — AUTORIZÁCIA POVINNÁ"',
      '',
      '// Cesta je voľná. Ale autorizácia? //',
    ],
    onEnter: function(){ S.hp=Math.max(0,S.hp-5); S.flex=Math.min(100,S.flex+2); Renderer.updateStats(); gainXP(20); addLog('HP -5. Ohybnosť +2.','ok'); },
    choices: [{ text:'[A] Pokračovať chodba', next:'jaskyne_stred' }]
  },

  jaskyne_tablet: {
    name: 'Jaskyne // Hacknutý Tablet',
    art: '💻',
    text: [
      'Systém je lokálny. Ľahký prístup.',
      '',
      'Mapa siete LAZARUS. Všetkých 7 uzlov.',
      'Uzol 7 = Vtáčnik. Je to jasné.',
      '',
      'Admin prístup — môžeš odložiť aktiváciu.',
      'Zadáš príkaz: DELAY 30MIN.',
      '',
      '"DELAY ACCEPTED. Nová aktivácia: 04:30."',
      '',
      '// Kúpil si čas. Teraz — uzol. //',
    ],
    onEnter: function(){ gainXP(30); S.hackStat=Math.min(100,S.hackStat+3); Renderer.updateStats(); S.flags['delay_lazarus']=true; addLog('LAZARUS odložený o 30 min. Hacking +3.','ok'); showNotif('⏱ LAZARUS delay: +30 minút'); },
    choices: [{ text:'[A] Ísť stredným koridorom', next:'jaskyne_stred' }]
  },

  jaskyne_stred: {
    name: 'Jaskyne // Stredný Koridor',
    art: '🕯️',
    text: [
      'Stredný koridor. Tma za prvých desať metrov je absolútna.',
      'Potom oči sa prispôsobia — steny sa javia svetlejšie, vlhkosť odráža svetlo baterky.',
      '',
      'Kroky. Len tvoje — ale echo ich zdvojuje, ztrojuje.',
      'Steny sú mokré. Na zemi: hlina s odtlačkami.',
      'Niekoho tu chodí. Pravidelne. Chodba je vyšliapaná, nie náhodná.',
      '',
      'Po sto metroch strop sa znižuje, potom náhle otvorí do malej predsiene.',
      'V strede: oceľové dvere. Masívne. Nie jaskynné — priemyselné, sem osadené.',
      '"OMEGA VAULT — PRÍSTUP LEN S AUTORIZÁCIOU"',
      '',
      'Vedľa dverí: mechanický zámok a elektronický čítač kariet. Obe vrstvy.',
      'Niekto nechcel aby sa sem dostalo len tak hocikto.',
      '',
      '// [LOGIKA] Priemyselné dvere v jaskyni z roku 2051 alebo neskôr.',
      '// Vtedy M.E.C. odkúpil pozemky. Nie náhoda. //',
    ],
    choices: [
      { text:'[A] Použiť keycard',  next:'bunker',
        cond:function(){ return hasItem('keycard'); }, condFail:'Nemáš keycard. FRI — laboratórium B7.' },
      { text:'[B] Vrátiť sa na vstup',       next:'jaskyne_vstup' },
      { text:'[C] Hacknúť zámok (HCK 30+)',  next:'jaskyne_hack_zamok',
        cond:function(){ return S.hackStat>=30; }, condFail:'HCK 30 potrebný. Systém je dvojvrstvový.' },
    ]
  },

  jaskyne_hack_zamok: {
    name: 'Jaskyne // Hacknutie Zámku',
    art: '🔓',
    text: [
      'AES-128. Implementácia je stará — 2058 alebo skôr. Vidíš to podľa štruktúry paketov.',
      'Nie na cracknutie brutom — ale má slabý bod v inicializačnom vektore.',
      '',
      'Štyri minúty. Tri. Dve.',
      '',
      'V tichu jaskyne počuješ niečo čo predtým nebolo.',
      'Kroky. Nie tvoje. Hlbšie v jaskyni — alebo za sebou.',
      'Blíže.',
      '',
      'Zámok klikne.',
      '',
      '// Prístup udelený. Kroky pribúdajú. Čas je vec minulosti. //',
    ],
    onEnter: function(){ gainXP(35); S.hackStat=Math.min(100,S.hackStat+5); Renderer.updateStats(); addLog('HCK +5. Omega Vault hacknutý.','ok'); },
    choices: [{ text:'[A] Vstúpiť — rýchlo', next:'bunker' }]
  },

  jaskyne_ticho: {
    name: 'Jaskyne // Tichý Sektor',
    art: '🌑',
    text: [
      'Chodba sa zužuje. Strop klesá. Teplota klesá.',
      '',
      'Na stenách: biele vlákna. Organické — nie plesnivé, niečo iné.',
      'Sieťka. Tenká ako pavučina, ale pevná. Dotknúť sa ich netreba aby si to vedel.',
      '',
      'Rovnaké ako pod Korzom. Rovnaké ako v správe od Oravca.',
      '"Bio-Echo senzory. Snímajú teplo, pohyb, biologické podpisy."',
      '"Ak si tu, môžu ťa vidieť."',
      '',
      '// [SAN -8] Niečo v jaskyni ťa sleduje a ty nevieš čo. //',
      '// [LOGIKA] Senzory sú živé. LAZARUS nie je len sieť — je to organizmus. //',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-8); Renderer.updateStats(); gainXP(10); addLog('SAN -8. Bio-Echo senzory aktívne — LAZARUS vidí.','warn'); },
    choices: [{ text:'[A] Pokračovať — nič iné nezostáva', next:'jaskyne_stred' }]
  },

  jaskyne_hlbina: {
    name: 'Jaskyne // Zostup',
    art: '⬇️',
    text: [
      'Schodisko dolu. Betón, nie kameň — novší ako jaskyňa, osadený dodatočne.',
      'Tridsať schodov. Štyridsať. Zvuk krokov sa mení — priestor sa otvára.',
      '',
      'Bunker.',
      '',
      '// To čo hľadáš je za poslednou stenou. //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [{ text:'[A] Vstúpiť', next:'bunker',
      cond:function(){ return hasItem('keycard'); }, condFail:'Keycard — bez nej dvere neotvoriš.' }]
  },

  // ── BUNKER / ZÁVER ─────────────────────────────────────────────
  bunker: {
    name: 'OMEGA VAULT // Bunker LAZARUS',
    art: '🔐',
    text: [
      'Dvere sa otvoria s tlakovým syčaním — vnútorná atmosféra je regulovaná.',
      'Vzduch je suchší. Chladnejší. Ako v serverovni, nie ako v jaskyni.',
      '',
      'Servery — tri rady, stropné chladiče, indikátory blikajú tmavozelenou.',
      'Uprostred miestnosti: terminál. Čierny displej s počítadlom.',
      '"LAZARUS PHASE 2 ACTIVATION: 23:14"',
      '"23:13 ... 23:12 ..."',
      '',
      'Pri termináloch stojí muž v laboratórnom plášti. Starší, šedivý.',
      'Neotočí sa hneď — ako keby vedel, že prídeš, a rozhodol sa dať ti sekundu.',
      '',
      'Potom sa otočí.',
      '"Vedel som, že príde niekto." Hlas unavený — nie vyhrážavý. Unavený.',
      '"Oravec vás poslal? Alebo niekto nový?"',
      '',
      '// [VNEM] Ruky má čisté. Nie vojak — vedec. Ale jeho oči nie sú oči niekoho',
      '// kto urobil chybu. Sú to oči niekoho kto si myslí, že má pravdu. //',
    ],
    onEnter: function(){ gainXP(30); addLog('OMEGA VAULT: terminál aktívny. Countdown beží. Koordinátor prítomný.','ok'); },
    choices: [
      { text:'[A] "Som tu to zastaviť."',       next:'bunker_dna' },
      { text:'[B] Hacknúť terminál (HCK 30+)', next:'bunker_hack',
        cond:function(){ return S.hackStat>=30; }, condFail:'HCK 30 — terminál má dvojitú autentifikáciu.' },
      { text:'[C] Zaútočiť (SIL 35+)',          next:'bunker_boj',
        cond:function(){ return S.str>=35; }, condFail:'SIL 35 — koordinátor nie je sám.' },
    ]
  },

  bunker_dna: {
    name: 'OMEGA VAULT // Koordinátor',
    art: '🔐',
    text: [
      '"Zastaviť." Opakuje slovo. Sadne si na stoličku pri termináloch.',
      '"Každý kto príde dole povie to isté. Zastaviť. Ako keby zastaviť bolo riešenie."',
      '',
      '"Viete čo sa stane ak to zastavíte? Skutočne viete?"',
      '"Voľby za tri mesiace. Kandidát X má pätnásť percent — lebo ľudia sa boja.",',
      '"Boja sa dobre, správne veci — ale strach ich robí iracionálnymi."',
      '"LAZARUS neodstráni strach. Zníži amplitúdu. Ľudia budú voliť rozumom, nie panikou."',
      '',
      '"To nie je kontrola. To je... stabilizácia."',
      '"Žiadna panika. Žiadna vojna. Žiadna kríza."',
      '"Len — pokoj."',
      '',
      '"Nechceš pokoj?"',
      '',
      '// [LOGIKA] Jeho argument nie je absurdný. Ale to je práve to čo je na ňom strašné. //',
      '// [EMPATIA] Verí tomu. Naozaj verí. Nie fanaticky — únavne, smutne. //',
    ],
    choices: [
      { text:'[A] "Pokoj bez slobody nie je pokoj." (vyžaduje Spis OMEGA)', next:'bunker_spis',
        cond:function(){ return hasItem('spis'); }, condFail:'Nemáš Spis OMEGA — argument bez dôkazu nestačí.' },
      { text:'[B] Hacknúť kým hovorí (HCK 25+)',  next:'bunker_hack',
        cond:function(){ return S.hackStat>=25; }, condFail:'HCK 25 — terminál je online.' },
      { text:'[C] Zaútočiť',                       next:'bunker_boj',
        cond:function(){ return S.str>=25; }, condFail:'SIL 25.' },
    ]
  },

  bunker_spis: {
    name: 'OMEGA VAULT // Konfrontácia so Spisom',
    art: '📁',
    text: [
      'Hodíš spis na stôl.',
      '"LAZARUS PHASE 2. ZOZNAM OBETÍ."',
      '"Toto nie je stabilita. Toto je program."',
      '',
      'Koordinátor sa zastaví.',
      'Dlhá pauza.',
      '"Kde si to vzal?"',
      '"Agent Delta." Ďalšia pauza.',
      '"Tomáš." Niečo sa v ňom zlomí.',
      '"Nevedel som o zozname. Oni mi nepovedali o zozname."',
      '',
      '"Daj mi chvíľku."',
      'Sadne si. Siahne po klávesnici.',
      '"Vypnem to."',
    ],
    onEnter: function(){ gainXP(50); S.flags['lazarus_zastaveny']=true; addLog('LAZARUS zastavený! Koordinátor vypol systém.','ok'); showNotif('🏆 LAZARUS deaktivovaný!'); },
    choices: [{ text:'[A] Víťazstvo — Záver', next:'bunker_koniec' }]
  },

  bunker_hack: {
    name: 'OMEGA VAULT // Hacknutie Terminálu',
    art: '💻',
    text: [
      'Terminál. Priamy prístup.',
      '',
      'Systém je komplexný — ale máš čas.',
      'Root prístup za sedem minút.',
      'LAZARUS SHUTDOWN PROTOCOL — EXECUTE.',
      '',
      '"SHUTDOWN CONFIRMED. ALL NODES OFFLINE."',
      '',
      '"Čo si urobil?!" Koordinátor skočí k terminálu.',
      'Ale je neskoro.',
      '"LAZARUS... vypnutý?"',
    ],
    onEnter: function(){ gainXP(60); S.hackStat=Math.min(100,S.hackStat+10); Renderer.updateStats(); S.flags['lazarus_zastaveny']=true; addLog('LAZARUS hacknutý a vypnutý! HCK +10.','ok'); showNotif('💻 LAZARUS vypnutý hackingom!'); },
    choices: [{ text:'[A] Záver operácie', next:'bunker_koniec' }]
  },

  bunker_boj: {
    name: 'OMEGA VAULT // Fyzický Boj',
    art: '⚔️',
    text: [
      'Priamy útok. Koordinátor nie je vojak.',
      '',
      'HP -20. Ale terminál je tvoj.',
      'EMERGENCY SHUTDOWN — YES.',
      '"LAZARUS SYSTEM OFFLINE."',
      '',
      'Koordinátor leží. Dýcha. Žije.',
      '"Ty... nevieš čo si urobil." Ticho.',
      '"Alebo možno vieš."',
    ],
    onEnter: function(){ S.hp=Math.max(0,S.hp-20); Renderer.updateStats(); gainXP(45); S.str=Math.min(100,S.str+5); S.flags['lazarus_zastaveny']=true; addLog('HP -20. Sila +5. LAZARUS vypnutý fyzicky.','warn'); if(S.hp<=0) gameOver('Vyčerpal si sa.'); else showNotif('⚔️ LAZARUS fyzicky zastavený!'); },
    choices: [{ text:'[A] Záver', next:'bunker_koniec' }]
  },

  bunker_koniec: {
    name: 'OMEGA VAULT // Záver Operácie',
    art: '🏆',
    text: [
      '03:58.',
      '',
      'LAZARUS je offline.',
      'Dve minúty pred aktiváciou.',
      '',
      'Vonku: Prievidza sa prebúdza.',
      'Ľudia netušia čo sa stalo.',
      'A možno je to tak lepšie.',
      '',
      'Tvoj telefón vibruje.',
      '"Výborne. — Druid"',
      '',
      '// CEO Zla víťazí. Operácia LAZARUS: NEUTRALIZOVANÁ. //',
    ],
    onEnter: function(){ gainXP(100); S.money += 50000; Renderer.updateMoney(); addLog('Operácia LAZARUS: NEUTRALIZOVANÁ. +50000₿ odmena.','ok'); setTimeout(function(){ winGame(); }, 2000); },
    choices: []
  },

  // ── LOKÁCIE — MESTO ────────────────────────────────────────────
  loc_namestie: {
    name: 'Nám. Slobody // Centrum',
    art: '⛪',
    text: [
      'Námestie. Fontána. Kostol sv. Michala.',
      '',
      'O 3:47 ráno — prázdne.',
      'Len závan cigaretového dymu od fontány.',
      '',
      'A muž s notebookom na lavičke.',
      '"Wi-fi tu funguje." Nevzhliadne.',
      '"Najlepší signál v centre. Okrem Vtáčnika, samozrejme."',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text:'[A] Zastaviť sa pri mužovi',  next:'loc_namestie_muž' },
      { text:'[B] Ísť na poštu',            next:'posta' },
      { text:'[C] Ísť do Jantaru',         next:'loc_jantar' },
      { text:'[D] Ísť na FRI',             next:'loc_fri' },
    
      { text:'[E] 🗣 Pýtať sa čo sa deje v meste',       next:'loc_namestie_deje' },
      { text:'[F] 🌿 Pýtať sa o jaskyne — varovanie',    next:'loc_namestie_jaskyne',
        cond:function(){ return !!S.flags['jaskyne_info']; }, condFail:'' },
      { text:'[G] 📁 Opýtať sa na LAZARUS reakciu',      next:'loc_namestie_lazarus',
        cond:function(){ return !!S.flags['lazarus_pozna']; }, condFail:'' },]
  },

  loc_namestie_muž: {
    name: 'Nám. Slobody // Hackerman',
    npcName: 'Anonym',
    art: '💻',
    text: [
      '"Čuješ? Signál zmutoval." Vzhliadne na teba.',
      '"Od minulého týždňa na 60 GHz. Netypicky pre Wi-Fi."',
      '"Niektoré zariadenia nereagujú správne."',
      '',
      '"Volaj ma Ghost. Mám niečo pre teba."',
      'Podá ti flashku.',
      '"Vírus. Na LAZARUS protokol. Ak sa dostaneš k terminálu."',
      '"HCK 20 stačí na nasadenie. Ale terminál musíš nájsť sám."',
    ],
    onEnter: function(){ gainXP(20); addItem('hack_pwnbox'); addLog('Ghost: Vírus pre LAZARUS terminál. PwnBox získaná.','ok'); },
    choices: [
      { text:'[A] Ísť na FRI',        next:'loc_fri' },
      { text:'[B] Ísť k jaskyniam',  next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },

  loc_miki: {
    name: 'Miki Bar // Nočné prevádzky',
    art: '🍺',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [
      'Miki bar. Nízke svetlo, hlučná hudba.',
      '',
      'Niekoľko chlapov pri baroch — zvyšky nočnej smeny.',
      '',
      'Lucia ťa odmeria spoza baru.',
      '"Čo budeš?"',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text:'[A] Pýtať sa Lucie',             next:'loc_miki_barman' },
      { text:'[B] Kúpiť fľašu whisky (120₿)', next:'loc_miki_flask' },
      { text:'[C] 🎲 Hrať hazard',             next:'loc_miki_hazard' },
      { text:'[D] 🔵 Vyjsť von — pozrieť sa kto je vonku',
        next: 'michal_encounter',
        cond: function(){ return !S.flags['michal_stretnuty']; },
        condFail: '' },
      { text:'[E] 🏠 Byt 4B — Michal',
        next: 'michal_byt_navrat',
        cond: function(){ return !!S.flags['michal_stretnuty']; },
        condFail: '' },
      { text:'[F] Odísť',                     next:'start' },
    
      { text:'[G] 🗣 Rozprávať sa s Luciou (podrobne)',  next:'loc_miki_lucia' },
      { text:'[H] 🔍 Opýtať sa na podozrivé autá',        next:'loc_miki_spz',
        cond:function(){ return !!S.flags['miki_spz_videl']; }, condFail:'' },
      { text:'[I] 🌿 Spýtať sa na jaskyne',              next:'loc_miki_jaskyne' },
      { text:'[J] 🔴 LAZARUS — priamo',                  next:'loc_miki_lazarus',
        cond:function(){ return !!S.flags['lazarus_pozna']; }, condFail:'' },]
  },

  loc_miki_hazard: {
    name: 'Miki Bar // Hazard',
    art: '🎲',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [
      'V rohu baru — malý stôl pokrytý zeleným plátnom.',
      '',
      'Lucia pokrčí ramenami.',
      '"Máme Blackjack a Sloty. Hra na vlastné riziko."',
      '"Všetky zisky — naše. Všetky straty — tvoje."',
      '"Štandardné podmienky."',
    ],
    onEnter: function(){ gainXP(2); },
    choices: [
      { text:'[A] 🃏 Hrať Blackjack',  next:'loc_miki_blackjack', skipHunger:true },
      { text:'[B] 🎰 Hrať Slot Machine', next:'loc_miki_slots', skipHunger:true },
      { text:'[C] 🤖 Poradiť sa s Daedalusom',
        cond: function(){ return !!S.flags['daedalus_01'] && !S.flags['daedalus_ignored']; },
        next: 'loc_miki_hazard_daedalus', skipHunger:true },
      { text:'[D] Späť za bar',        next:'loc_miki' },
    ]
  },

  loc_miki_hazard_daedalus: {
    name: 'Miki Bar // Daedalus — Hazard',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    art: '🃏',
    text: [
      '"Hazard." Pauza. "Zaujímavé."',
      '"Lucia mieša karty štandardnou technikou — 7 riffle shuffles, AKS protokol. Dá sa predpovedať pri dostatočnej vizuálnej dátovej vzorke."',
      '"Mám dostatočnú vzorku po 3 minútach pozorovania." Pauza. "Technicky."',
      '"Slot machine má seed generovaný pri každom stlačení. Seed závisí od časovača — 47ms okno kde je výsledok priaznivý."',
      '"Nie je to podvádzanie," dodá Daedalus filozoficky, "je to len lepší timing."',
      '"Chceš hint alebo preferuješ autentický hazard s autentickými stratami?"',
    ],
    choices: [
      { text: '"Daj mi tip na Blackjack." [Prvá karta viditeľná]',
        action: function(){
          S.flags['daedalus_bj_hint'] = true;
          addLog('Daedalus: BJ analýza aktívna. Lucia si nevšimla.', 'info');
          showNotif('🃏 Daedalus: prvá karta dealera viditeľná — +15% šanca');
        },
        next: 'loc_miki_blackjack', skipHunger: true },
      { text: '"Timing na Sloty."',
        action: function(){
          S.flags['daedalus_slot_hint'] = true;
          addLog('Daedalus: slot timing kalibrácia. 47ms okno aktívne.', 'info');
          showNotif('🎰 Daedalus: timing hint aktívny — +10% šanca');
        },
        next: 'loc_miki_slots', skipHunger: true },
      { text: '"Nie. Chcem hrať férovo."',
        action: function(){ S.san = Math.min(100, S.san+2); Renderer.updateStats(); addLog('Odmietol si AI pomoc. SAN +2.', 'ok'); },
        next: 'loc_miki_hazard' },
      { text: '"Počkaj — toto je legálne?"',
        next: 'loc_miki_hazard_daedalus_legal' },
    ]
  },

  loc_miki_hazard_daedalus_legal: {
    name: 'Kasíno // Daedalus — Legalita',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    art: '⚖️',
    text: [
      '"Legálne?" Pauza dlhšia ako zvyčajne.',
      '"Definícia závisí od jurisdikcie, paragrafu a — čo je dôležitejšie — od toho či ťa niekto vidí."',
      '"V tejto miestnosti: 0 kamier. Lucia má vypnutý augmentovaný zrak kvôli migrénám každý piatok."',
      '"Dnes je piatok."',
      '"Tak aby som odpovedal na tvoju otázku: v praxi, v tejto miestnosti, v tento konkrétny večer — áno."',
      '"Právna otázka je filozoficky zaujímavá. Praktická otázka je: chceš vyhrať alebo nie?"',
    ],
    choices: [
      { text: '"Beriem hint."',
        action: function(){ S.flags['daedalus_bj_hint'] = true; addLog('Daedalus BJ hint aktívny.', 'info'); },
        next: 'loc_miki_blackjack', skipHunger: true },
      { text: '"Nie. Toto nie je pre mňa." [SAN +3]',
        action: function(){ S.san = Math.min(100, S.san+3); Renderer.updateStats(); addLog('Odmietol si. SAN +3. Daedalus: zaznamenané.', 'ok'); },
        next: 'loc_miki_hazard' },
    ]
  },

  loc_miki_blackjack: {
    name: 'Miki Bar // Blackjack',
    art: '🃏',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [''],
    onEnter: function(){ setTimeout(function(){ openBlackjack(); }, 100); },
    choices: [
      { text:'[A] Späť k hazardu', next:'loc_miki_hazard', skipHunger:true },
    ]
  },

  loc_miki_slots: {
    name: 'Miki Bar // Slot Machine',
    art: '🎰',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    text: [''],
    onEnter: function(){ setTimeout(function(){ openSlots(); }, 100); },
    choices: [
      { text:'[A] Späť k hazardu', next:'loc_miki_hazard', skipHunger:true },
    ]
  },

  loc_miki_barman: {
    name: 'Miki Bar // Lucia',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '🍺',
    text: [
      '"Počuješ o tých 5G vežiach?" Lucia si utriera pohár.',
      '"Hovorí sa že ich stavajú bez povolenia."',
      '"Vtáčnik — starý vysielač — tam dali niečo nové."',
      '"Moji zákazníci hovoria, že od minulého mesiaca —"',
      '"— ľudia sú pokojnejší. Ale inak. Ako keby im zobral niečo."',
      '"Ako keď vypneš emócie."',
    ],
    onEnter: function(){ gainXP(10); S.flags['miki_info']=true; addLog('Miki bar: Lucia — Vtáčnik + nová veža.','ok'); },
    choices: [
      { text:'[A] Ísť k Vtáčniku',    next:'banovce_cesta' },
      { text:'[B] Ísť na poštu',      next:'posta' },      { text:'[C] Odísť',                     next:'start' },
    ]
  },

  loc_miki_flask: {
    name: 'Miki Bar // Whisky',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '🥃',
    text: [
      '"Jedna fľaša. 120 kreditov."',
      'Lucia podá fľašu whisky.',
      '"Na zdravie. A — daj si pozor vonku."',
    ],
    onEnter: function(){ if(S.money>=120){ S.money-=120; addItem('flask'); Renderer.updateMoney(); addLog('Whisky kúpená: -120₿','ok'); } else { addLog('Nedostatok kreditov.','warn'); } },
    choices: [{ text:'[A] Odísť', next:'start' }]
  },

  loc_miki_jedlo: {
    name: 'Miki Bar // Jedlo',
    npcName: 'Lucia',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '🍔',
    text: [
      'Lucia ukáže na tabuľu.',
      '"Máme ešte z večera: Burger, Polievka, Kebab."',
      '"Na takúto hodinu — celkom slušné."',
      '"Varíme len pre nočných šmejdov ako ty."',
    ],
    choices: [
      { text:'[A] Burger (60₿ | Hlad -40, HP +10)',     next:'loc_miki_jedlo_burger' },
      { text:'[B] Polievka (30₿ | Hlad -30, SAN +5)',   next:'loc_miki_jedlo_polievka' },
      { text:'[C] Kebab (45₿ | Hlad -50)',              next:'loc_miki_jedlo_kebab' },
      { text:'[D] Odísť bez jedla',                     next:'loc_miki' },
    ]
  },

  loc_miki_jedlo_burger: {
    name: 'Miki Bar // Burger',
    art: '🍔',
    text: [
      'Beef patty, eidam, slanina. Teplé.',
      '"Posledný," hovorí Lucia.',
      '',
      'Prvé jedlo za niekoľko hodín. Telo hovorí ďakujem.',
    ],
    onEnter: function(){
      if(S.money>=60){ S.money-=60; HungerSystem.eat(40); S.hp=Math.min(100,S.hp+10); Renderer.updateMoney(); Renderer.updateStats(); addLog('Burger: Hlad -40, HP +10. -60₿','ok'); showNotif('🍔 Burger zjedený!'); }
      else { addLog('Nedostatok kreditov.','warn'); }
    },
    choices: [{ text:'[A] Späť do baru', next:'loc_miki' }]
  },

  loc_miki_jedlo_polievka: {
    name: 'Miki Bar // Polievka',
    art: '🍲',
    text: [
      'Guľášová. Hustá. Horúca.',
      'Zahreje od vnútra.',
      '',
      '"Dedova receptúra," povie Lucia. "Nepýtaj sa čo v tom je."',
    ],
    onEnter: function(){
      if(S.money>=30){ S.money-=30; HungerSystem.eat(30); S.san=Math.min(100,S.san+5); Renderer.updateMoney(); Renderer.updateStats(); addLog('Polievka: Hlad -30, SAN +5. -30₿','ok'); showNotif('🍲 Polievka zjedená!'); }
      else { addLog('Nedostatok kreditov.','warn'); }
    },
    choices: [{ text:'[A] Späť do baru', next:'loc_miki' }]
  },

  loc_miki_jedlo_kebab: {
    name: 'Miki Bar // Kebab',
    art: '🌯',
    text: [
      'Kuracie mäso, tzatziki, zelenina.',
      'Veľký. Sýty.',
      '',
      '"Najlepší kebab na severnom Slovensku," tvrdí Lucia.',
      '"Neoverené, ale nepoprené."',
    ],
    onEnter: function(){
      if(S.money>=45){ S.money-=45; HungerSystem.eat(50); Renderer.updateMoney(); Renderer.updateStats(); addLog('Kebab: Hlad -50. -45₿','ok'); showNotif('🌯 Kebab zjedený!'); }
      else { addLog('Nedostatok kreditov.','warn'); }
    },
    choices: [{ text:'[A] Späť do baru', next:'loc_miki' }]
  },

  // ── SQUASH ─────────────────────────────────────────────────────
  loc_squash: {
    name: 'Squash Restaurant // Nočná',
    art: '🏓',
    text: [
      'Squash reštaurácia. Zatvorené — ale cez okno svetlo.',
      '',
      'Kuchár čistí kuchyňu.',
      '"Prišiel si kvôli squashi?" Nevšíma si čas.',
      '"Alebo kvôli jedlu? Máme zvyšky. Zadarmo — musíme vyhodiť."',
      '',
      '// Zadarmo jedlo? Vždy vítané. //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text:'[A] Zobrať zvyšky (Hlad -35, HP +5)',   next:'loc_squash_jedlo' },
      { text:'[B] Odísť',                              next:'start' },
    
      { text:'[C] 🗣 Opýtať sa o FRI a nočné udalosti',  next:'loc_squash_fri' },
      { text:'[D] 🌿 Pýtať sa na Vtáčnik',               next:'loc_squash_vtacnik' },
      { text:'[E] 📋 Informácie o okolí',                next:'loc_squash_info' },]
  },

  loc_squash_jedlo: {
    name: 'Squash // Zvyšky z kuchyne',
    art: '🍱',
    text: [
      'Studená pizza, chlieb, kúsok syra.',
      'Nie gurmánska záležitosť. Ale jedlo je jedlo.',
      '',
      '"Drž sa," hovorí kuchár. "Táto noc bude dlhá."',
    ],
    onEnter: function(){
      HungerSystem.eat(35);
      S.hp = Math.min(100, S.hp+5);
      Renderer.updateStats();
      gainXP(5);
      addLog('Zvyšky zjedené: Hlad -35, HP +5.','ok');
      showNotif('🍱 Zadarmo jedlo z kuchyne!');
    },
    choices: [{ text:'[A] Poďakovať a odísť', next:'start' }]
  },

  // ── DOMOV ──────────────────────────────────────────────────────
  loc_domov: {
    name: 'Domov // Byt agenta',
    art: '🏠',
    text: [
      'Tvoj byt. Zamknutý. Ale poštová schránka je otvorená.',
      '',
      'Vo vnútri: list. Bez odosielateľa.',
      '"NESTAČÍ. LAZARUS SA ZASTAVÍ. —A.D."',
      '',
      'Na stole: zvyšky hotovosti — 50₿.',
      'A v kuchyni: chlieb, maslo, zvyšok salamy z včera.',
    ],
    onEnter: function(){ gainXP(5); S.money += 50; Renderer.updateMoney(); addLog('Byt: list od A.D. +50₿ nájdené.','ok'); },
    choices: [
      { text:'[A] Ísť späť do centra',            next:'start' },
      { text:'[B] Zjesť doma (Hlad -30)',          next:'loc_domov_jedlo' },
      { text:'[C] Oddychovať (HP +15, SAN +5)',    next:'loc_domov_oddych' },
    
      { text:'[D] 💬 Rozprávať sa s Evou',               next:'loc_domov_rozpravat' },
      { text:'[E] 🆘 Požiadať Evu o pomoc',              next:'loc_domov_pomoc',
        cond:function(){ return !!S.flags['eva_zoznamena']; }, condFail:'' },]
  },

  loc_domov_jedlo: {
    name: 'Domov // Rýchle jedlo',
    art: '🥪',
    text: [
      'Chlieb, maslo, salama.',
      'Stojíš pri linke a ješ.',
      '',
      'Nič špeciálne. Ale telo to potrebovalo.',
    ],
    onEnter: function(){
      HungerSystem.eat(30);
      Renderer.updateStats();
      gainXP(3);
      addLog('Chlieb so salamou: Hlad -30.','ok');
      showNotif('🥪 Domáce jedlo!');
    },
    choices: [{ text:'[A] Pokračovať v misii', next:'start' }]
  },

  loc_domov_oddych: {
    name: 'Domov // Krátky Odpočinok',
    art: '🛏️',
    text: [
      'Pätnásť minút. Musí to stačiť.',
      'HP sa obnoví čiastočne.',
      '',
      'Keď vstaneš — jasnejší mozog. Trochu.',
      '"Čas: 03:52." Ešte máš čas.',
    ],
    onEnter: function(){ S.hp=Math.min(100,S.hp+15); S.san=Math.min(100,S.san+5); Renderer.updateStats(); gainXP(5); addLog('Odpočinok: HP +15, SAN +5.','ok'); },
    choices: [{ text:'[A] Pokračovať v misii', next:'start' }]
  },

  // ── STANICA ─────────────────────────────────────────────────────
  loc_stanica: {
    name: 'Železničná Stanica // Prievidza',
    npcName: 'Dušan Kováľ',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/dusan.png',
    art: '🚉',
    text: [
      'Stanica. Tichá. Jeden zamestnanec za prepážkou.',
      '',
      'Dušan Kováľ. Nočná smena. Číta niečo, rýchlo schová.',
      '"Dobrú noc." Nervózny pohľad. "Niečo potrebujete?"',
      '',
      'V rohu čakárne: automat na kávu a čokoládové tyčinky.',
    ],
    onEnter: function(){ gainXP(8); },
    choices: [
      { text:'[A] „Čo ste čítali?"',            next:'loc_stanica_dusal' },
      { text:'[B] Pýtať sa na autobus',          next:'loc_stanica_autobus' },
      { text:'[C] Preskúmať čakáreň',           next:'loc_stanica_cakaren' },
      { text:'[D] Automat — káva (20₿ | +SAN)', next:'loc_stanica_kava' },
      { text:'[E] Odísť',                        next:'start' },
    
      { text:'[G] 🕵 Pristúpiť k agentovi Delta',        next:'loc_stanica_delta',
        cond:function(){ return !!S.flags['delta_info']; }, condFail:'' },]
  },

  loc_stanica_kava: {
    name: 'Stanica // Automat na Kávu',
    art: '☕',
    text: [
      'Automatová káva. Vo plastovom poháriku.',
      'Nie espresso. Ale horúca a kofeinová.',
      '',
      'Mozog sa trochu preberie.',
      '',
      '// Kofein: SAN +8, Hlad -10. Ale hlad trochu ukojí. //',
    ],
    onEnter: function(){
      if(S.money>=20){
        S.money-=20;
        S.san=Math.min(100,S.san+8);
        HungerSystem.eat(10);
        Renderer.updateMoney(); Renderer.updateStats();
        addLog('Káva: SAN +8, Hlad -10. -20₿','ok');
        showNotif('☕ Kofein kick!');
      } else { addLog('Nedostatok kreditov (20₿).','warn'); }
    },
    choices: [
      { text:'[A] Čokoládová tyčinka (15₿ | Hlad -15)', next:'loc_stanica_tycinka' },
      { text:'[B] Späť k Dušanovi',                      next:'loc_stanica' },
    ]
  },

  loc_stanica_tycinka: {
    name: 'Stanica // Tyčinka',
    art: '🍫',
    text: [
      'Snickers. Klasika.',
      '"Prines si aj mne," volá Dušan spoza prepážky.',
    ],
    onEnter: function(){
      if(S.money>=15){
        S.money-=15;
        HungerSystem.eat(15);
        Renderer.updateMoney();
        addLog('Tyčinka: Hlad -15. -15₿','ok');
      } else { addLog('Nedostatok kreditov (15₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_stanica' }]
  },

  loc_stanica_autobus: {
    name: 'Stanica // Autobus',
    npcName: 'Dušan Kováľ',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/dusan.png',
    art: '🕵️',
    text: [
      '"Autobus?" Dušan sa na teba pozrie.',
      '"Posledný odišiel o 23:40."',
      '"Ďalší je o 05:15."',
      '',
      '"Ale pri výjazde z mesta stojí Janošík — čierny mercedes."',
      '"Chodí tam a späť celú noc."',
    ],
    onEnter: function(){ gainXP(10); S.flags['stanica_autobus_info']=true; },
    choices: [
      { text:'[A] Pýtať sa na mercedes',         next:'loc_stanica_mercedes' },
      { text:'[B] Vrátiť sa do centra',           next:'start' },
    ]
  },

  loc_stanica_mercedes: {
    name: 'Stanica // Čierny Mercedes',
    npcName: 'Dušan Kováľ',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/dusan.png',
    art: '🕵️',
    text: [
      '"Mercedes." Dušan sa odvrátil.',
      '"Každú noc tam stojí. Príde o jednej. Odíde o štvrtej."',
      '"Vodič mal za uchom niečo. Malé. Blikajúce."',
      '"Myslel som — bluetooth. Teraz si nie som istý."',
      '',
      '// Implantát. LAZARUS terén. //',
    ],
    onEnter: function(){ gainXP(15); S.flags['mercedes_jazva']=true; addLog('Mercedes — vodič s implantátom.','ok'); },
    choices: [
      { text:'[A] Ísť na poštu', next:'posta' },
      { text:'[B] Preskúmať čakáreň', next:'loc_stanica_cakaren' },
    ]
  },

  loc_stanica_dusal: {
    name: 'Stanica // Zoznam',
    npcName: 'Dušan Kováľ',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/dusan.png',
    art: '🕵️',
    text: [
      '"Nič." Tri výhovory za päť sekúnd.',
      '',
      'Pod pultom — papier. Hustý text. Mená a dátumy.',
      '"Dostal som to v pondelok. Anonymne."',
      '"Niektorých tých ľudí poznám. Všetci zmizli."',
      '"Pred dátumami vedľa mien."',
      '',
      '// Zoznam obetí LAZARUS — vopred plánovaný. //',
    ],
    onEnter: function(){ gainXP(25); S.san=Math.max(0,S.san-10); Renderer.updateStats(); S.flags['stanica_zoznam']=true; addLog('SAN -10. Zoznam obetí LAZARUS.','warn'); },
    choices: [
      { text:'[A] „Môžem vidieť zoznam?"',   next:'loc_stanica_zoznam_ukaz' },
      { text:'[B] Ísť za Druidom',           next:'posta' },
    ]
  },

  loc_stanica_zoznam_ukaz: {
    name: 'Stanica // Zoznam LAZARUS',
    npcName: 'Dušan Kováľ',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/dusan.png',
    art: '🕵️',
    text: [
      'Dvadsaťtri mien. Dátumy. Niektoré v budúcnosti.',
      '',
      'A dolu — bez dátumu:',
      '"<b>AGENT DELTA — NEUTRALIZÁCIA PRIORITNÁ</b>"',
      '',
      '// Si ty Agent Delta? //',
    ],
    onEnter: function(){ gainXP(30); S.flags['lazarus_zoznam']=true; addItem('spis'); addLog('Zoznam LAZARUS = Spis OMEGA získaný.','ok'); showNotif('Zoznam obetí LAZARUS + Spis OMEGA!'); },
    choices: [
      { text:'[A] Ísť za Druidom',       next:'posta' },
      { text:'[B] Ísť do Bánoviec',      next:'banovce_cesta' },
    ]
  },

  loc_stanica_cakaren: {
    name: 'Stanica // Čakáreň',
    art: '🕵️',
    text: [
      'Štyri stoličky. Žlté svetlo.',
      '',
      'Na jednej stoličke: zabudnutý batoh. Zips otvorený.',
      'Zápisník, pero, sušienky — a prázdna injekčná striekačka.',
      '',
      '// Nie drogy. Injekcia má etiketu: BIO-MARKER SER-7. //',
      '',
      'Vedľa batohu: rozložená energetická tyčinka. Napoly zjedená.',
    ],
    onEnter: function(){ gainXP(15); S.flags['stanica_batoh']=true; addLog('Batoh v čakárni: BIO-MARKER SER-7.','ok'); showNotif('Nájdený: BIO-MARKER SER-7!'); },
    choices: [
      { text:'[A] Vziať zápisník',                      next:'loc_stanica_zapisnik' },
      { text:'[B] Pýtať sa Dušana na batoh',            next:'loc_stanica_dusal' },
      { text:'[C] Zobrať tyčinku (Hlad -20, zadarmo)',  next:'loc_stanica_tyc_free' },
      { text:'[D] Ignorovať a odísť',                   next:'start' },
    ]
  },

  loc_stanica_tyc_free: {
    name: 'Stanica // Nájdená Tyčinka',
    art: '🍫',
    text: [
      'Rozbalená. Neotravnej chuti. Ale tvoje telo to príjme.',
      '"Zrieš cudzí jedlo?" Dušan sa pozrie cez okno.',
      'Potom pokrčí ramenami. "Tá tam leží od rána."',
    ],
    onEnter: function(){
      HungerSystem.eat(20);
      gainXP(2);
      addLog('Nájdená tyčinka: Hlad -20.','ok');
    },
    choices: [{ text:'[A] Zobrať zápisník', next:'loc_stanica_zapisnik' }]
  },

  loc_stanica_zapisnik: {
    name: 'Stanica // Zápisník',
    npcName: 'Dušan Kováľ',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/dusan.png',
    art: '🕵️',
    text: [
      'Zápisník. Jemné písmo. Dátumy a časy.',
      '',
      '"03:47 — signál čistý. Uzol 4 aktívny."',
      '"04:01 — pulz anomálie. Oravec potvrdzuje."',
      '"04:15 — vlastná expozícia. Dozimetrické kontroly."',
      '',
      'Posledný záznam — dnes. Pred hodinou:',
      '"BIO-MARKER aplikovaný. Ak zmiznem — zápisník a striekačka sú dôkaz."',
      '"Moje meno: <b>Tomáš Dravecký</b>. Technik FRI. Agent Delta."',
      '',
      '// Agent Delta je TU. V čakárni. Alebo bol. //',
    ],
    onEnter: function(){ gainXP(35); S.flags['agent_delta_tomas']=true; addItem('spis'); addLog('Agent Delta = Tomáš Dravecký, technik FRI.','ok'); showNotif('Agent Delta nájdený: Tomáš Dravecký!'); },
    choices: [
      { text:'[A] Hľadať Tomáša na FRI',              next:'loc_fri' },
      { text:'[B] Ísť za Druidom s touto informáciou', next:'posta' },
      { text:'[C] Ísť priamo do bunkra',              next:'bunker',
        cond:function(){ return hasItem('keycard'); }, condFail:'Potrebuješ keycard.' },
    ]
  },

  // ── FRI ────────────────────────────────────────────────────────
  loc_fri: {
    name: 'FRI // Fakulta Riadenia',
    art: '🎓',
    text: [
      'Budova FRI. Moderná fasáda, tmavé okná.',
      '',
      'Ale jedno okno svieti — suterén.',
      '',
      'Pri vstupe: strážnik. Spí s opretou hlavou.',
      '',
      'Vedľa vchodu: automat s jedlom. Svietiaci v tme.',
    ],
    onEnter: function(){ gainXP(10); },
    choices: [
      { text:'[A] Tichý vstup cez vchod',         next:'loc_fri_chodba' },
      { text:'[B] Zaklopiť na suterén',           next:'loc_fri_dvere' },
      { text:'[C] Hacknúť prístup (HCK 15+)',     next:'loc_fri_hack_vstup',
        cond:function(){ return S.hackStat>=15; }, condFail:'HCK 15+ potrebný.' },
      { text:'[D] Automat — energetický nápoj (25₿)', next:'loc_fri_automat' },
    ]
  },

  loc_fri_automat: {
    name: 'FRI // Automat',
    art: '🥤',
    text: [
      'Red Bull. Posledný v automate.',
      'Kto tu nakupuje o štvrtej ráno?',
      '',
      'Možno ty nie si prvý.',
      '',
      '// Kofein + taurín: SAN +10, Hlad -5. Ale spánok bude horší. //',
    ],
    onEnter: function(){
      if(S.money>=25){
        S.money-=25;
        S.san=Math.min(100,S.san+10);
        HungerSystem.eat(5);
        Renderer.updateMoney(); Renderer.updateStats();
        addLog('Red Bull: SAN +10, Hlad -5. -25₿','ok');
        showNotif('🥤 Red Bull! Wings.');
      } else { addLog('Nedostatok kreditov (25₿).','warn'); }
    },
    choices: [{ text:'[A] Ísť dnu', next:'loc_fri_chodba' }]
  },

  loc_fri_chodba: {
    name: 'FRI // Chodba',
    art: '🎓',
    text: [
      'Tmavá chodba. Linoleum. Bulletin boardy.',
      '',
      'Na jednom: "PROJEKT SIEŤOVEJ SYNCHRONIZÁCIE — VÝSLEDKY Q3"',
      'Vedľa: "Dr. ORAVEC — LABORATÓRIUM B7 — OBMEDZENÝ PRÍSTUP"',
      '',
      'Schodisko dolu — k suterénu.',
    ],
    onEnter: function(){ gainXP(8); },
    choices: [
      { text:'[A] Ísť dolu k Oravcovi',   next:'loc_fri_dvere' },
      { text:'[B] Preskúmať bulletin',     next:'loc_fri_bulletin' },
    ]
  },

  loc_fri_bulletin: {
    name: 'FRI // Bulletin Board',
    art: '📋',
    text: [
      'Výsledky projektu. Grafy. Frekvenčné krivky.',
      '',
      '"Biologická responzivita pri 60 GHz: +340%"',
      '"Subkortikálna sugescia: POZITÍVNE VÝSLEDKY"',
      '"Etická komisia: POZASTAVENÁ — Viď príloha OMEGA-2"',
      '',
      '// OMEGA-2. Etika pozastavená. Kto to schválil? //',
    ],
    onEnter: function(){ gainXP(15); S.hackStat=Math.min(100,S.hackStat+2); Renderer.updateStats(); addLog('FRI bulletin: etická komisia pozastavená. HCK +2.','ok'); },
    choices: [{ text:'[A] Ísť k Oravcovi', next:'loc_fri_dvere' }]
  },

  loc_fri_hack_vstup: {
    name: 'FRI // Hacknutie Vstupu',
    art: '🔓',
    text: [
      'Prístupový systém. Starší firmware.',
      'Bypass za dve minúty.',
      '',
      'Suterén je odomknutý.',
      '"B7 — ORAVEC LAB"',
    ],
    onEnter: function(){ gainXP(20); S.hackStat=Math.min(100,S.hackStat+2); Renderer.updateStats(); addLog('FRI vstup hacknutý. HCK +2.','ok'); },
    choices: [{ text:'[A] Vstúpiť do suterénu', next:'loc_fri_suteren' }]
  },

  loc_fri_dvere: {
    name: 'FRI // Zaklopanie',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      'Zaklope trikrát. Ticho.',
      'Zaklope silnejšie.',
      '',
      'Oravec otvorí. Pozrie na teba.',
      '"Kto ste?"',
      '"Hodinky ukazujú 02:30. Toto nie je čas na návštevy."',
      '',
      'Oči má unavené. Ale bdelosť nie.',
      '"Čo chcete?"',
    ],
    choices: [
      { text:'[A] „Viem o LAZARUS protokole."', next:'loc_fri_lazarus' },
      { text:'[B] „Som z inšpekcie."',           next:'loc_fri_inspekcia' },
      { text:'[C] Zaútočiť a vojsť silou',       next:'loc_fri_boj',
        cond:function(){ return S.str>=20; }, condFail:'SIL 20+ potrebné.' },
    ]
  },

  loc_fri_inspekcia: {
    name: 'FRI // Falošná Inšpekcia',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      'Oravec sa zasmeje. Nie veselo.',
      '"Inšpekcia. O tretej ráno."',
      '"Neviem kto vás poslal, ale —"',
      '"— ak ste tu skutočne kvôli projektu, viete o čom hovorím."',
      '',
      '"Povedzte mi jedno slovo. Kód. Ak viete správny, pustím vás dnu."',
    ],
    choices: [
      { text:'[A] „OMEGA-7-DELTA"',         next:'loc_fri_suteren',
        cond:function(){ return S.flags['lazarus_zoznam'] || S.flags['mapa_jaskyn']; }, condFail:'Kód nepoznáš — musíš ho nájsť.' },
      { text:'[B] Uznať, že si ich nemáš',  next:'loc_fri_lazarus' },
    ]
  },

  loc_fri_boj: {
    name: 'FRI // Násilný Vstup',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      'Tlačíš ho dnu. Oravec nekričí.',
      'Prekvapene pozrie.',
      '"Takže... tak to bude."',
      '',
      '"Dobre. Vidím, že nemáš čas na zdvorilosť."',
      '"Ani ja."',
    ],
    onEnter: function(){ gainXP(10); S.str=Math.min(100,S.str+1); addLog('Násilný vstup. Oravec súhlasí.','warn'); },
    choices: [{ text:'[A] Ísť do suterénu', next:'loc_fri_suteren' }]
  },

  loc_fri_suteren: {
    name: 'FRI // Suterén',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      'Suterén. Nie bežné laboratórium.',
      '',
      'Frekvenčné oscilátory. Antenové polia v miniatúre. Servery.',
      'A na stene — živá mapa Prievidze s pulzujúcimi bodmi.',
      '',
      'Uzly. Sedem uzlov. Uzol 7 bliká červenou.',
      '"Primárny." Nápis vedľa: "VTÁČNIK OMEGA CORE".',
      '',
      'Na stole vedľa monitora: nedojedená pizza a studená káva.',
      'Oravec tu sedí hodiny.',
    ],
    onEnter: function(){ gainXP(25); S.flags['fri_mapa']=true; addLog('Mapa uzlov LAZARUS. Vtáčnik = primárny uzol.','ok'); activateOp('op-lazarus'); },
    choices: [
      { text:'[A] „Čo je LAZARUS?"',              next:'loc_fri_lazarus' },
      { text:'[B] Hacknúť konzoly (HCK 25+)',      next:'loc_fri_hack',
        cond:function(){ return S.hackStat>=25; }, condFail:'Nedostatočný Hacking (25+).' },
      { text:'[C] „Pracuješ pre nich?"',           next:'loc_fri_konfrontacia' },
    ]
  },

  loc_fri_lazarus: {
    name: 'FRI // Oravec o LAZARUS',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      'Oravec si sadne. Dlhá pauza.',
      '"LAZARUS." Opakuje slovo ako keby ho skúšal.',
      '',
      '"Projekt rezonančnej synchronizácie. Teoreticky — harmonizácia biologických rytmov."',
      '"Prakticky —" Zastaví sa.',
      '"Prakticky, kto ho riadi, má iné plány."',
      '',
      '"Pracoval som pre nich rok. Myslel som, že to je výskum."',
      '"Keď som zistil na čo to použijú — chcel som odísť."',
      '"Povedali mi, že odísť nemôžem."',
      '',
      '"Ty si tu, lebo niekto má dôvod to zastaviť. Čo potrebuješ?"',
    ],
    onEnter: function(){ gainXP(30); addLog('Oravec: insider LAZARUS, chce pomôcť.','ok'); S.flags['oravec_spojenec']=true; activateOp('op-druid'); },
    choices: [
      { text:'[A] „Kde je bunker?"',          next:'loc_fri_bunker_info' },
      { text:'[B] „Ako zastaviť LAZARUS?"',   next:'loc_fri_stop' },
      { text:'[C] „Daj mi keycard."',         next:'loc_fri_keycard' },
    ]
  },

  loc_fri_konfrontacia: {
    name: 'FRI // Konfrontácia',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      '"Pracujem pre nich?"',
      'Dlhá pauza.',
      '"Pracoval. Minulý čas."',
      '"Teraz pracujem napriek nim."',
      '',
      '"Rozdiel je malý. Ale pre mňa — všetko."',
    ],
    onEnter: function(){ gainXP(10); S.flags['oravec_spojenec']=true; },
    choices: [{ text:'[A] Pokračovať v rozhovore', next:'loc_fri_lazarus' }]
  },

  loc_fri_bunker_info: {
    name: 'FRI // Koordináty Bunkra',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      'Oravec vytlačí výpis z konzoly.',
      '"Bunker je pod Vtáčnikom. Vstup cez jaskyňu — stredný koridor."',
      '"Keycard OMEGA — musíš ho získať. Alebo —"',
      'Pozrie na svoju zásuvku.',
      '"Alebo ho dám ja."',
      '',
      'Vytrhne kartičku z vrecka.',
      '"Duplikát. Nestačí na hlavné dvere, ale bočný vstup áno."',
      '"Choď. Zastaviť to môže len jeden človek naraz. Koordinátor."',
    ],
    onEnter: function(){ addItem('keycard'); gainXP(20); addLog('Keycard od Oravca.','ok'); },
    choices: [
      { text:'[A] Ísť do bunkra',            next:'bunker',
        cond:function(){ return hasItem('spis'); }, condFail:'Potrebuješ aj spis OMEGA.' },
      { text:'[B] Pýtať sa ako zastaviť',    next:'loc_fri_stop' },
    ]
  },

  loc_fri_stop: {
    name: 'FRI // Ako Zastaviť LAZARUS',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      '"Ako?" Oravec vstane a chodí po miestnosti.',
      '"LAZARUS beží na frekvenčnom uzle — Vtáčnik."',
      '"Ak sa aktivuje o štvrtej, signál zasiahne všetky uzly súčasne."',
      '"Výsledok: 60 GHz saturácia kyslíka v ovzduší. Mesto."',
      '"Nie smrť. Niečo horšie — poddajnosť. Mentálna."',
      '',
      '"Zastavenie: buď fyzické prerušenie uzla 7,"',
      '"alebo konfrontácia koordinátora a vírus do systému."',
      '"Druhá možnosť — potrebuješ HCK 30 alebo viac."',
    ],
    onEnter: function(){ gainXP(20); S.flags['lazarus_plan']=true; addLog('Plán: fyzicky alebo hackingom zastaviť LAZARUS.','ok'); activateOp('op-5g'); },
    choices: [
      { text:'[A] Ísť zastaviť fyzicky — jaskyňa', next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky nepôjdeš.' },
      { text:'[B] Ísť do bunkra', next:'bunker',
        cond:function(){ return hasItem('keycard') && hasItem('spis'); }, condFail:'Potrebuješ keycard + spis.' },
    ]
  },

  loc_fri_keycard: {
    name: 'FRI // Žiadosť o Keycard',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      '"Keycard." Oravec sa zastaví.',
      '"Mám jeden. Duplikát."',
      '"Ale dám ti ho len ak mi sľúbiš jedno:"',
      '"Koordinátora nezabiješ. Len zastaviš."',
      '"Je to... komplikovaný prípad. Nie je úplne slobodný vo svojich rozhodnutiach."',
      '',
      'Podá keycard.',
      '"A ak prežiješ — povedz mi čo nájdeš dnu."',
    ],
    onEnter: function(){ addItem('keycard'); gainXP(15); S.flags['oravec_slib']=true; addLog('Keycard + sľub Oravcovi.','ok'); },
    choices: [
      { text:'[A] Ísť do bunkra', next:'bunker',
        cond:function(){ return hasItem('spis'); }, condFail:'Potrebuješ aj spis OMEGA.' },
      { text:'[B] Opýtať sa na LAZARUS', next:'loc_fri_lazarus' },
    ]
  },

  loc_fri_hack: {
    name: 'FRI // Hacknutie Systému',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      'Oravec ťa nechá — prekvapivo — pri konzole.',
      '"Ak to zvládneš, môžeš vidieť celú sieť."',
      '"Ak nie, alarm za pätnásť sekúnd."',
      '',
      'Písanie. Rýchle rozhodnutia. Vnorená štruktúra — ale dá sa.',
      '',
      'Kompletná mapa LAZARUS siete. Sedem uzlov. Bunkre. Koordinátor.',
      'A niečo iné: protokol označený "BIO-ECHO".',
      '"Biologický odraz" — čo to znamená, nevieš. Ale je to zapnuté.',
    ],
    onEnter: function(){ gainXP(35); S.hackStat=Math.min(100,S.hackStat+5); Renderer.updateStats(); S.income.hack+=2; Renderer.updateIncome(); addItem('spis'); addLog('Hacking +5. Bio-Echo objavený. Spis OMEGA extrahovaný.','ok'); activateOp('op-lazarus'); },
    choices: [
      { text:'[A] Ísť do bunkra', next:'bunker',
        cond:function(){ return hasItem('keycard'); }, condFail:'Potrebuješ keycard.' },
      { text:'[B] Spýtať sa Oravca na Bio-Echo', next:'loc_fri_bioecho' },
    ]
  },

  loc_fri_bioecho: {
    name: 'FRI // BIO-ECHO',
    npcName: 'Dr. Pavel Oravec',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/oravec.png',
    art: '🔬',
    text: [
      '"BIO-ECHO?" Oravec zbladne.',
      '"To by nemal byť aktívny. To je posledná fáza."',
      '',
      '"BIO-ECHO skenuje biologické signatúry. Hľadá... anomálie."',
      '"Naše. Ľudské."',
      '"Každý kto bol blízko uzla — je označený."',
      '',
      '"Ty si tu. Teda ty si označený."',
      '"Koordinátor ťa vidí. Teraz. Reálny čas."',
      '',
      '// SAN -15. Toto nie je teória. //',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-15); Renderer.updateStats(); gainXP(20); addLog('SAN -15. BIO-ECHO: si označený.','warn'); },
    choices: [
      { text:'[A] Ísť do bunkra čo najrýchlejšie', next:'bunker',
        cond:function(){ return hasItem('keycard'); }, condFail:'Potrebuješ keycard.' },
      { text:'[B] Ísť do jaskýň',                  next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },

  // ── JANTAR ─────────────────────────────────────────────────────
  loc_jantar: {
    name: 'Jantar Club // Vstup',
    npcName: 'Viktor Neon',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/viktor.png',
    art: '🎵',
    text: [
      'Jantar. Klub. Nočný.',
      '',
      'Vrátnička v čiernom.',
      '"Vstupné 20₿. Alebo — si pozvaný?"',
      '',
      'Cez dvere: hudba. Dym. Červené svetlo.',
    ],
    choices: [
      { text:'[A] Zaplatiť vstupné (20₿)',          next:'loc_jantar_vnutri' },
      { text:'[B] Tvárniť sa ako pozvaný',           next:'loc_jantar_charm',
        cond:function(){ return S.san>=60; }, condFail:'Nie si dosť sebavedomý (SAN 60+).' },
      { text:'[C] Odísť',                             next:'start' },
    ]
  },

  loc_jantar_charm: {
    name: 'Jantar // Charizma',
    art: '🎵',
    text: [
      '"Pozvaný?" Vrátnička sa pozrie.',
      '"Viktor hovoril, že príde niekto."',
      '"Dobre. Vojdi."',
      '',
      '// Niekedy stačí sebaistota. //',
    ],
    onEnter: function(){ gainXP(10); addLog('Vstup do Jantaru zadarmo.','ok'); },
    choices: [{ text:'[A] Vojsť', next:'loc_jantar_vnutri' }]
  },

  loc_jantar_vnutri: {
    name: 'Jantar Club // Vnútri',
    npcName: 'Viktor Neon',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/viktor.png',
    art: '🎵',
    text: [
      'Klub. Plný napriek hodine.',
      '',
      'Bar v rohu. Barmanka zbiera poháre.',
      'VIP sekcia za sklom — muž v obleku.',
      '',
      'Viktor Neon. Hovorí sa o ňom veľa.',
      'Vidí ťa. Kýve na teba.',
      '',
      '// Na bare: menu s nočnými špeciálmi. Jedlo dostupné. //',
    ],
    onEnter: function(){ gainXP(10); S.flags['jantar_vstup']=true; },
    choices: [
      { text:'[A] Ísť za Viktorom',                next:'loc_jantar_viktor' },
      { text:'[B] Pýtať sa barmanky',             next:'loc_jantar_barmanka' },
      { text:'[C] Nočné špeciály — jedlo (50₿)',  next:'loc_jantar_jedlo' },
      { text:'[D] Preskúmať zadné schodisko',     next:'loc_jantar_zadne',
        cond:function(){ return S.flags['jantar_vstup']; } },
    ]
  },

  loc_jantar_jedlo: {
    name: 'Jantar // Nočné Špeciály',
    art: '🍽️',
    text: [
      'Menu na tabuli:',
      '"NOČNÉ ŠPECIÁLY: Tapas (50₿), Nachos (35₿), Syr tanier (40₿)"',
      '',
      'Barmanka čaká.',
    ],
    choices: [
      { text:'[A] Tapas (50₿ | Hlad -45, SAN +5)',     next:'loc_jantar_tapas' },
      { text:'[B] Nachos (35₿ | Hlad -35)',            next:'loc_jantar_nachos' },
      { text:'[C] Syr tanier (40₿ | Hlad -40, HP +8)', next:'loc_jantar_syr' },
      { text:'[D] Späť',                               next:'loc_jantar_vnutri' },
    ]
  },

  loc_jantar_tapas: {
    name: 'Jantar // Tapas',
    art: '🫒',
    text: [
      'Španielske tapas. Olivy, jamón, bruschetta.',
      'Prekvapivo dobré na takúto hodinu.',
    ],
    onEnter: function(){
      if(S.money>=50){ S.money-=50; HungerSystem.eat(45); S.san=Math.min(100,S.san+5); Renderer.updateMoney(); Renderer.updateStats(); addLog('Tapas: Hlad -45, SAN +5. -50₿','ok'); showNotif('🫒 Tapas!'); }
      else { addLog('Nedostatok kreditov (50₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_jantar_vnutri' }]
  },

  loc_jantar_nachos: {
    name: 'Jantar // Nachos',
    art: '🌮',
    text: [
      'Veľký tanier nachosov. S dipmi.',
      'Jednoduché. Účinné.',
    ],
    onEnter: function(){
      if(S.money>=35){ S.money-=35; HungerSystem.eat(35); Renderer.updateMoney(); Renderer.updateStats(); addLog('Nachos: Hlad -35. -35₿','ok'); showNotif('🌮 Nachos!'); }
      else { addLog('Nedostatok kreditov (35₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_jantar_vnutri' }]
  },

  loc_jantar_syr: {
    name: 'Jantar // Syrový Tanier',
    art: '🧀',
    text: [
      'Rôzne syry, hrozno, orechy.',
      'Bohatý na proteíny. Telo to ocení.',
    ],
    onEnter: function(){
      if(S.money>=40){ S.money-=40; HungerSystem.eat(40); S.hp=Math.min(100,S.hp+8); Renderer.updateMoney(); Renderer.updateStats(); addLog('Syrový tanier: Hlad -40, HP +8. -40₿','ok'); showNotif('🧀 Syrový tanier!'); }
      else { addLog('Nedostatok kreditov (40₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_jantar_vnutri' }]
  },

  loc_jantar_barmanka: {
    name: 'Jantar // Barmanka',
    npcName: 'Jana',
    art: '🍹',
    text: [
      '"Čo vám dám?" Jana. Rýchla. Pozorná.',
      '"Viktor tu sedí každú noc. Sleduje."',
      '"Predvčerom sa tu bili. Prišli traja — hľadali niekoho."',
      '"Pýtali sa na FRI. Na Oravca."',
      '"Viktor ich nechal hovoriť. Potom zavolal niekomu."',
      '"Na druhý deň tí traja zmizli."',
      '',
      '// Viktor = spojka. Alebo strážca. //',
    ],
    onEnter: function(){ gainXP(15); S.flags['jantar_jana']=true; addLog('Jana: Viktor sleduje FRI. Traja muži zmizli.','warn'); },
    choices: [
      { text:'[A] Ísť za Viktorom',  next:'loc_jantar_viktor' },
      { text:'[B] Drink (30₿)',      next:'loc_jantar_drink' },
    ]
  },

  loc_jantar_drink: {
    name: 'Jantar // Drink',
    art: '🥃',
    text: [
      'Whisky. Neat.',
      '"Prvý je vždy od baru," hovorí Jana.',
      '',
      'SAN +5. Hlad -5. Nervy sa trochu upokoja.',
    ],
    onEnter: function(){
      S.san=Math.min(100,S.san+5); HungerSystem.eat(5); Renderer.updateStats();
      gainXP(3); addLog('Drink: SAN +5.','ok');
    },
    choices: [{ text:'[A] Ísť za Viktorom', next:'loc_jantar_viktor' }]
  },

  loc_jantar_viktor: {
    name: 'Jantar // Viktor Neon',
    npcName: 'Viktor Neon',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/viktor.png',
    art: '🧑',
    text: [
      '"Vedel som, že prídeš." Viktor si naleje sám.',
      '"Nie ty konkrétne. Ale — niekto."',
      '',
      '"LAZARUS beží. Mesto to cíti aj keby to nevedelo."',
      '"Ľudia pijú viac. Spia menej. Sú tu."',
      '',
      '"Mám záujem to zastaviť?"',
      'Pauza.',
      '"Mám záujem zostať v biznise. LAZARUS nie je dobrý pre biznis."',
      '"Ľudia bez emócií nepijú."',
    ],
    onEnter: function(){ gainXP(20); S.flags['viktor_spojenec']=true; addLog('Viktor Neon: pragmatický spojenec. LAZARUS kazí biznis.','ok'); },
    choices: [
      { text:'[A] Prijať Viktorovu pomoc',     next:'loc_jantar_viktor_pomoc' },
      { text:'[B] Odmietnut — konať sám',      next:'start' },
    ]
  },

  loc_jantar_viktor_pomoc: {
    name: 'Jantar // Viktorova Pomoc',
    npcName: 'Viktor Neon',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/viktor.png',
    art: '🧑',
    text: [
      '"Dobrá voľba." Viktor vytasí obálku.',
      '"Keycard. Skutočný. Nie duplikát."',
      '"Mám kontakty všade — aj na FRI."',
      '',
      '"A toto." Papier. Koordináty.',
      '"Zadný vchod do bunkra. Bez strážnikov."',
      '"Verím, že viete čo s tým."',
      '',
      '"Povedzte koordinátorovi — Viktor posiela pozdravy."',
    ],
    onEnter: function(){ addItem('keycard'); gainXP(25); S.flags['viktor_keycard']=true; addLog('Viktor: Keycard (skutočný) + koordináty zadného vchodu.','ok'); showNotif('Viktor Neon ti pomáha!'); },
    choices: [
      { text:'[A] Ísť do bunkra', next:'bunker',
        cond:function(){ return hasItem('spis'); }, condFail:'Potrebuješ spis OMEGA.' },
      { text:'[B] Ísť najprv na FRI', next:'loc_fri' },
    ]
  },

  loc_jantar_zadne: {
    name: 'Jantar // Zadné Schodisko',
    npcName: 'Viktor Neon',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/viktor.png',
    art: '🧑',
    text: [
      'Dvierka v stene sú nezamknuté.',
      'Za nimi schodisko dolu — betonové, bez osvetlenia okrem núdzovej červenej.',
      '',
      'Dolu: miestnosť s konzolami. Monitory. Frekvenciemetre.',
      'A na stene — mapa s vyznačenými bodmi po celom meste.',
      '',
      'Jeden bod je označený: <b>VTÁČNIK UZOL 7 — PRIMÁRNY</b>.',
      '',
      'Počuješ kroky zhora.',
    ],
    onEnter: function(){ gainXP(25); S.flags['uzol7']=true; addLog('Mapa uzlov LAZARUS — Vtáčnik Uzol 7.','ok'); showNotif('Stopa: Vtáčnik Uzol 7 = primárny uzol LAZARUS'); },
    choices: [
      { text:'[A] Rýchlo urobiť foto a utiecť',    next:'loc_jantar_unik' },
      { text:'[B] Zostať a hacknúť konzoly',       next:'loc_jantar_hack',
        cond:function(){ return S.hackStat>=20; }, condFail:'Nedostatočný Hacking skill (potrebuješ 20+).' },
    ]
  },

  loc_jantar_boj: {
    name: 'Jantar // Boj vo Bare',
    npcName: 'Viktor Neon',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/viktor.png',
    art: '🧑',
    text: [
      'Traja na jedného. Neideálne.',
      '',
      'Prvý padne — prekvapenie.',
      'Druhý ti dá ranu. <b>HP -20.</b>',
      'Tretí — Viktor — stojí bokom a sleduje.',
      '"Zaujímavé," hovorí. Nie bojí sa. Je zvedavý.',
      '',
      'Kým second vstáva, vybehneš.',
      '"Ešte sa stretneme," zazneje za tebou.',
    ],
    onEnter: function(){ S.hp=Math.max(0,S.hp-20); S.str=Math.min(100,S.str+2); Renderer.updateStats(); gainXP(20); addLog('HP -20, Sila +2. Únik z Jantara.','warn'); if(S.hp<=0) gameOver('Viktorovi muži ťa zneškodnili.'); },
    choices: [
      { text:'[A] Ísť k Druidovi — pošta', next:'posta' },
      { text:'[B] Ísť do jaskýň',          next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky nepôjdeš.' },
    ]
  },

  loc_jantar_unik: {
    name: 'Jantar // Únik',
    art: '🏃',
    text: [
      'Rýchlo hore. Kroky za tebou.',
      '',
      'Von. Noc. Chladný vzduch.',
      '',
      'V ruke: fotka na telefóne. Mapa. Uzol 7.',
      'Dôkaz.',
    ],
    onEnter: function(){ gainXP(15); S.flags['foto_mapa']=true; addLog('Foto mapy uzlov LAZARUS.','ok'); },
    choices: [
      { text:'[A] Ísť na poštu', next:'posta' },
      { text:'[B] Ísť na FRI',  next:'loc_fri' },
    ]
  },

  loc_jantar_hack: {
    name: 'Jantar // Hacknutie Konzol',
    npcName: 'Viktor Neon',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/viktor.png',
    art: '🧑',
    text: [
      'Systém je starší. Ochrana slabšia ako si čakal.',
      '',
      'Nájdeš logy — dátumy, frekvencie, kódové mená.',
      '"AGENT DELTA" — pravidelné vstupy. Meno, nie kód: <b>P. Oravec</b>.',
      '',
      'Dr. Pavel Oravec. FRI.',
      '// Conexia: FRI je súčasť siete LAZARUS. //',
    ],
    onEnter: function(){ gainXP(30); S.hackStat=Math.min(100,S.hackStat+3); Renderer.updateStats(); S.flags['fri_spojenie']=true; addLog('Hacking +3. FRI = LAZARUS uzol.','ok'); activateOp('op-lazarus'); },
    choices: [
      { text:'[A] Ísť na FRI ku Dr. Oravcovi',    next:'loc_fri' },
      { text:'[B] Ísť do bunkra',                 next:'bunker',
        cond:function(){ return hasItem('keycard') && hasItem('spis'); }, condFail:'Chýba keycard alebo spis.' },
    ]
  },

  // ── KORZO ───────────────────────────────────────────────────────
  loc_korzo: {
    name: 'Korzo OC // Obchodné Centrum',
    art: '🛍️',
    text: [
      'Sklenené dvere. Poloprázdne chodby. Svetlo príliš biele.',
      '',
      '<b>Silvia Brand</b> — manažérka pobočky luxusného oblečenia — kroží na platformových topánkach.',
      'Keď ťa zazrie, spomalí.',
      '"Nový zákazník?" Tón: otáznik, nie pozdrav.',
      '',
      '"Alebo nie zákazník."',
      '',
      'Neďaleko: food court. Pár stánkov ešte otvorených.',
    ],
    choices: [
      { text:'[A] „Hľadám konkrétny predmet."',        next:'loc_korzo_predmet' },
      { text:'[B] „Čo sa tu deje po zatváraní?"',      next:'loc_korzo_noc' },
      { text:'[C] Prezrieť food court (jedlo)',        next:'loc_korzo_foodcourt' },
      { text:'[D] Odísť',                              next:'loc_namestie' },
    ]
  },

  loc_korzo_foodcourt: {
    name: 'Korzo // Food Court',
    art: '🍕',
    text: [
      'Food court. Tri stánky otvorené pre nočnú smenu upratovačiek.',
      '',
      '"Kebab House", "Pizza To Go", "Čínska záhrada"',
      '',
      'Lacnejšie ako v bare. Rýchlejšie.',
    ],
    choices: [
      { text:'[A] Kebab (40₿ | Hlad -45)',             next:'loc_korzo_kebab' },
      { text:'[B] Pizza slice (25₿ | Hlad -25, HP +5)',next:'loc_korzo_pizza' },
      { text:'[C] Vyprážaná ryža (20₿ | Hlad -30)',    next:'loc_korzo_ryzda' },
      { text:'[D] Späť k Silvii',                       next:'loc_korzo' },
    ]
  },

  loc_korzo_kebab: {
    name: 'Korzo // Kebab House',
    art: '🌯',
    text: [
      '"Jeden doner." Balík v alobale. Horúci.',
      '"Posledný na dnes," hovorí predavač.',
    ],
    onEnter: function(){
      if(S.money>=40){ S.money-=40; HungerSystem.eat(45); Renderer.updateMoney(); Renderer.updateStats(); addLog('Kebab: Hlad -45. -40₿','ok'); showNotif('🌯 Kebab zjedený!'); }
      else { addLog('Nedostatok kreditov (40₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_korzo' }]
  },

  loc_korzo_pizza: {
    name: 'Korzo // Pizza',
    art: '🍕',
    text: [
      'Slice margherity. Teplý. Chrumkavý.',
      'Klasika.',
    ],
    onEnter: function(){
      if(S.money>=25){ S.money-=25; HungerSystem.eat(25); S.hp=Math.min(100,S.hp+5); Renderer.updateMoney(); Renderer.updateStats(); addLog('Pizza: Hlad -25, HP +5. -25₿','ok'); showNotif('🍕 Pizza!'); }
      else { addLog('Nedostatok kreditov (25₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_korzo' }]
  },

  loc_korzo_ryzda: {
    name: 'Korzo // Čínska Záhrada',
    art: '🍚',
    text: [
      'Vyprážaná ryža. Vajíčko, zelenina.',
      '"Extra omáčka?" Pýta sa malá babička za pultem.',
      '"Zadarmo pre nočných."',
    ],
    onEnter: function(){
      if(S.money>=20){ S.money-=20; HungerSystem.eat(30); Renderer.updateMoney(); Renderer.updateStats(); addLog('Ryža: Hlad -30. -20₿','ok'); showNotif('🍚 Vyprážaná ryža!'); }
      else { addLog('Nedostatok kreditov (20₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_korzo' }]
  },

  loc_korzo_predmet: {
    name: 'Korzo // Silvia — Nákup',
    art: '💳',
    text: [
      'Silvia si ťa odmeria od hlavy po päty.',
      '"Čo hľadáte?"',
      '',
      '"Máme zimné kolekcie, technické oblečenie, balistické vesty— "',
      'Zastaví sa. Príliš rýchlo to povedala.',
      '"— teda horolezecké vesty. Pre outdoor nadšencov."',
    ],
    onEnter: function(){ S.flags['korzo_vest']=true; },
    choices: [
      { text:'[A] Kúpiť štandardný predmet', next:'loc_korzo_shop' },
      { text:'[B] „Balistická vesta — koľko?"', next:'loc_korzo_vest' },
      { text:'[C] Spýtať sa na noc',           next:'loc_korzo_noc' },
    ]
  },

  loc_korzo_shop: {
    name: 'Korzo // Obchod Silvie',
    art: '🛍️',
    text: [
      '"Štandardné?" Silvia siahne za pult.',
      '"Mám medkit, baterku, mäkkú ochrannú vestu."',
      '"A — " zastaví sa. "Pozriem čo mám vzadu — špeciálne elektronické doplnky, to obyčajné obchody nemajú."',
      '"Len hotovosť. Bez dokladov."',
    ],
    choices: [
      { text:'[A] Medkit (150₿)',      next:'loc_korzo_buy_medkit' },
      { text:'[B] Baterka (80₿)',      next:'loc_korzo_buy_baterka' },
      { text:'[C] Špeciálna elektronika', next:'loc_korzo_special_shop' },
      { text:'[D] Odísť',             next:'loc_korzo' },
    ]
  },

  loc_korzo_special_shop: {
    name: 'Korzo // Špeciálna Elektronika',
    art: '🔌',
    text: [
      'Silvia vytiahne zo zadnej skrine krabičku so špeciálnymi položkami.',
      '"Toto sa inde nekúpi — aspoň nie v Prievidzi. Dovoz z Bratislavy cez jeden kontakt."',
      '',
      '"USB-C kábel — vyzerá ako bežný kábel, ale má integrovaný data-bridge chip. 120₿."',
      '"Niektorí ľudia ho hľadajú zúfalo." Usmeje sa vedome.',
    ],
    choices: [
      { text:'[A] Kúpiť USB-C kábel (120₿)',
        cond: function(){ return !hasItem('usbc_kabel'); },
        condFail: 'Už ho máš.',
        action: function(){
          if(S.money>=120){
            S.money-=120; addItem('usbc_kabel');
            Renderer.updateMoney();
            addLog('USB-C kábel kúpený v Korzo: -120₿','ok');
            showNotif('🔌 USB-C kábel — v inventári');
            QuestSystem.updateTracker();
          } else { addLog('Nedostatok kreditov (120₿).','err'); showNotif('❌ Nedostatok peňazí'); }
        },
        next:'loc_korzo_special_shop' },
      { text:'[B] Späť',  next:'loc_korzo_shop' },
    ]
  },

  loc_korzo_buy_medkit: {
    name: 'Korzo // Kúpa Medkitu',
    art: '🩹',
    text: [ '"150₿." Podá balík.' ],
    onEnter: function(){
      if(S.money>=150){ S.money-=150; addItem('lekárnička'); Renderer.updateMoney(); addLog('Medkit kúpený: -150₿','ok'); }
      else { addLog('Nedostatok kreditov (150₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_korzo' }]
  },

  loc_korzo_buy_baterka: {
    name: 'Korzo // Kúpa Baterky',
    art: '🔦',
    text: [ '"80₿." Taktická baterka.' ],
    onEnter: function(){
      if(S.money>=80){ S.money-=80; addItem('baterka'); Renderer.updateMoney(); addLog('Baterka kúpená: -80₿','ok'); }
      else { addLog('Nedostatok kreditov (80₿).','warn'); }
    },
    choices: [{ text:'[A] Späť', next:'loc_korzo' }]
  },

  loc_korzo_vest: {
    name: 'Korzo // Špeciálne Vybavenie',
    art: '🛡️',
    text: [
      'Silvia ťa odprevadí do zadnej miestnosti.',
      '"500 kreditov. Balistická vesta. Ochrana triedy IIIA."',
      '"Neviem odkiaľ to máme. Len viem, že predávame."',
      '"Dúfam, že vám pomôže."',
    ],
    onEnter: function(){
      if(S.money>=500){ S.money-=500; S.hp=Math.min(100,S.hp+20); Renderer.updateMoney(); Renderer.updateStats(); addItem('kevlar_vest'); addLog('Vesta: -500₿, HP +20, Kevlarová vesta.','ok'); gainXP(10); }
      else { addLog('Nedostatok kreditov (500₿).','err'); }
    },
    choices: [
      { text:'[A] Spýtať sa o nočných udalostiach', next:'loc_korzo_noc' },
      { text:'[B] Odísť',                           next:'start' },
    ]
  },

  loc_korzo_noc: {
    name: 'Korzo // Po Zatváraní',
    art: '🌃',
    text: [
      'Silvia sa rozhliadne. Obchod je prázdny.',
      '"Po zatváraní." Dá si do poriadku vlasy.',
      '"Centrum sa zatvára o 21:00. Ale niektoré dvere ostávajú otvorené."',
      '"Prichádzajú z podchodu. Áno, máme podchod. Nie je na mape."',
      '',
      '"Keď som zostala raz dlhšie — počula som zvuky."',
      '"Nízkofrekvenčné. Ako keď vám vibruje hrudný kôš, nie uši."',
    ],
    onEnter: function(){ gainXP(15); S.flags['korzo_podchod']=true; addLog('Stopa: podchod pod Korzom.','ok'); },
    choices: [
      { text:'[A] „Ukáž mi podchod."',   next:'loc_korzo_podchod' },
      { text:'[B] Poďakovať a odísť',    next:'start' },
    ]
  },

  loc_korzo_podchod: {
    name: 'Korzo // Podchod',
    art: '🚇',
    text: [
      'Silvia ťa odprevadí ku kovovým dverám pri WC.',
      '"Ďalej nepôjdem."',
      '',
      'Dvere sú odomknuté. Za nimi schodisko dolu.',
      '',
      'Na stenách: vodovodné potrubia, káble — a niečo iné.',
      'Jemné vlákna, biele, organické. Ako mycélium.',
      '',
      '// Organické vlákna — biologická prítomnosť pod mestom. SAN -10 //',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-10); Renderer.updateStats(); gainXP(20); addLog('SAN -10. Vlákna pod mestom.','warn'); S.flags['podchod_vlakna']=true; },
    choices: [
      { text:'[A] Ísť ďalej dolu',  next:'jaskyne_ticho' },
      { text:'[B] Vrátiť sa',        next:'loc_korzo' },
    ]
  },

  loc_korzo_pocuvat: {
    name: 'Korzo // Odpočúvanie',
    art: '🎧',
    text: [
      'Prechádzaš sa cez obchody. Uši otvorené.',
      '',
      'Fragment: Dve ženy v kaviarni.',
      '"...nechcem vedieť čo je v tej prílohe emailu..."',
      '"...Oravec posiela každý piatok. Vždy zašifrované..."',
      '',
      'Mladík pri telefóne: "...signál tu blokujú. Od minulého mesiaca."',
      '"Choď na Vtáčnik, tam to chytíš..."',
    ],
    onEnter: function(){ gainXP(12); S.flags['oravec_email']=true; },
    choices: [
      { text:'[A] Ísť na FRI ku Oravcovi', next:'loc_fri' },
      { text:'[B] Spýtať sa Silvie',       next:'loc_korzo_noc' },
    ]
  },

  // ── BÁNOVCE / VTÁČNIK ──────────────────────────────────────────
  banovce_cesta: {
    name: 'Bánovce n/B // Príjazd',
    art: '🏔️',
    text: [
      'Vtáčnik. Telekomunikačná veža na kopci.',
      '',
      'Stará antická stavba plus — nová prístavba.',
      'Kovová. Moderná. Neladí s okolím.',
      '',
      'Signál tu je silný. Príliš silný.',
      'Tvoj telefón vibruje nepretržite.',
      '',
      '// SAN -5 od expozície. Toto je uzol 7. //',
    ],
    onEnter: function(){ gainXP(20); S.san=Math.max(0,S.san-5); Renderer.updateStats(); S.flags['vtacnik_navstiva']=true; addLog('Vtáčnik: Uzol 7. SAN -5 od frekvencie.','warn'); activateOp('op-5g'); },
    choices: [
      { text:'[A] Preskúmať nová prístavbu',     next:'banovce_meranie' },
      { text:'[B] Hľadať vstup do jaskyne',      next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
      { text:'[C] Odfotografovať dôkazy',        next:'banovce_foto' },
    ]
  },

  banovce_meranie: {
    name: 'Bánovce // EMF Meranie',
    art: '📡',
    text: [
      'Prístavba. Oceľové dvere. Zamknuté.',
      '',
      'Ale cez vetracie mriežky: hukot. Elektrický.',
      'Dosimeter by zošalel.',
      '',
      'Na dverách: "VTÁČNIK OMEGA — TECHNICKÁ MIESTNOSŤ"',
      '"VSTUP LEN S AUTORIZÁCIOU"',
      '',
      '// Toto je server room pre uzol 7. //',
    ],
    onEnter: function(){ gainXP(15); S.flags['vtacnik_server']=true; if(hasItem('detektor')){ S.hackStat=Math.min(100,S.hackStat+3); Renderer.updateStats(); addLog('Detektor: signál zameraný. HCK +3.','ok'); } },
    choices: [
      { text:'[A] Prerušiť napájanie (SIL 30+)',  next:'banovce_odpoj',
        cond:function(){ return S.str>=30; }, condFail:'SIL 30+ potrebné.' },
      { text:'[B] Hacknúť (HCK 25+)',             next:'banovce_hack',
        cond:function(){ return S.hackStat>=25; }, condFail:'HCK 25+ potrebné.' },
      { text:'[C] Ísť do jaskyne pod kopcom',     next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },

  banovce_odpoj: {
    name: 'Bánovce // Sabotáž Veže',
    art: '⚡',
    text: [
      'Vedľa budovy: transformátorová skriňa.',
      'Zaistená. Ale hrubá páka — fyzická sila — stačí.',
      '',
      'CRACK. Svetlá v prístavbe zhasnú.',
      '',
      '"VTÁČNIK UZOL 7 — OFFLINE" zaznie niekde v tme na monitore.',
      '',
      'Ale — záložné napájanie. Uzol 7 beží ďalej.',
      '"Nezastavil si to. Len spomalil."',
      '// Na úplné zastavenie: bunker. //',
    ],
    onEnter: function(){ gainXP(30); S.str=Math.min(100,S.str+3); Renderer.updateStats(); S.flags['vtacnik_offline_casto']=true; addLog('Vtáčnik offline (dočasne). SIL +3.','ok'); showNotif('⚡ Uzol 7 spomalený!'); },
    choices: [
      { text:'[A] Ísť do bunkra na úplné zastavenie', next:'bunker',
        cond:function(){ return hasItem('keycard') && hasItem('spis'); }, condFail:'Potrebuješ keycard + spis.' },
      { text:'[B] Ísť do jaskyne',                    next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },

  banovce_hack: {
    name: 'Bánovce // Hack Uzla',
    art: '💻',
    text: [
      'Cez vetracie mriežky: RJ45 kábel. Dosahuje vonku.',
      '',
      'PwnBox. Priame pripojenie.',
      'Systém uzla. Nie bunker — len uzol.',
      '',
      '"VTÁČNIK NODE 7 — DEGRADED MODE"',
      'Výkon znížený na 30%.',
      '',
      '"Nezastavil si to. Ale Druid to pocíti — daj mu vedieť."',
    ],
    onEnter: function(){ gainXP(35); S.hackStat=Math.min(100,S.hackStat+4); Renderer.updateStats(); S.flags['vtacnik_degraded']=true; addLog('Vtáčnik degradovaný na 30%. HCK +4.','ok'); showNotif('💻 Uzol 7 degradovaný!'); },
    choices: [
      { text:'[A] Ísť do bunkra', next:'bunker',
        cond:function(){ return hasItem('keycard') && hasItem('spis'); }, condFail:'Potrebuješ keycard + spis.' },
      { text:'[B] Ísť za Druidom', next:'posta' },
    ]
  },

  banovce_foto: {
    name: 'Bánovce // Dokumentácia',
    art: '📸',
    text: [
      'Fotografuješ všetko. Prístavba. Antény. Káble.',
      '',
      'GPS: 48.7702°N 18.6196°E — presne ako na nápise v centre.',
      '',
      'Toto je dôkaz. Veža bez stavebného povolenia.',
      'Frekvenčné zariadenia skryté v starom telekome.',
      '',
      '// Dokumentácia = dôkaz pre verejnosť. Ale teraz: zastaviť. //',
    ],
    onEnter: function(){ gainXP(20); S.flags['vtacnik_foto']=true; addLog('Foto Vtáčnik: dôkaz.','ok'); },
    choices: [
      { text:'[A] Ísť do jaskyne', next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
      { text:'[B] Ísť za Druidom', next:'posta' },
    ]
  },

  banovce_vlam: {
    name: 'Bánovce // Alarm',
    art: '🚨',
    text: [
      'Alarm. Červené svetlo.',
      '',
      'Strážnici prichádzajú. Traja.',
      '',
      'Utekáš.',
      'HP -10 — šrapnel z varovného výstrelu.',
      '',
      '"Dostal si sa príliš blízko," hovorí Druid neskôr.',
      '"Ale teraz vieš kde je bunker."',
    ],
    onEnter: function(){ S.hp=Math.max(0,S.hp-10); Renderer.updateStats(); gainXP(15); addLog('Alarm! HP -10. Útok.','warn'); if(S.hp<=0) gameOver('Strážnici ťa dostihli.'); },
    choices: [
      { text:'[A] Utiecť na poštu',  next:'posta' },
      { text:'[B] Utiecť do jaskyne',next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },


  // ── Mapa aliasy — nové lokácie zo scén (SCÉNA 001–004) ────────────
  loc_zagorska: {
    name: 'Gym Zagorská // Tréning',
    art: '🏋️',
    text: [
      'Gym na Zagorskej. Základné zariadenie, ale funguje.',
      'Kovové stroje, vôňa chloru zo šatne. Pár chlapov s augmentmi — biceps posiľňovne sa stretáva s kybernetikou.',
      '',
      '// [PROSTREDIE] Na nástenke inzerát: "Hľadáme sparingového partnera. Platíme." Podpísaný: Kuba M. //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: '💪 Trénovať (STR +1, HP -5)',
        action: function(){ S.str = (S.str||10)+1; S.hp = Math.max(10, S.hp-5); Renderer.updateStats(); addLog('Tréning: STR +1, HP -5', 'ok'); },
        next: 'loc_zagorska' },
      { text: '🤸 Strečing (SAN +3, FLEX +1)',
        action: function(){ S.san = Math.min(100, S.san+3); S.flex = (S.flex||10)+1; Renderer.updateStats(); addLog('Strečing: SAN +3, FLEX +1', 'ok'); },
        next: 'loc_zagorska' },
      { text: '📋 Pozrieť inzerát na nástenke', next: 'loc_zagorska_inzerat' },
      { text: '🤖 Spýtať sa Daedalusa na tréning',
        cond: function(){ return !!S.flags['daedalus_01'] && !S.flags['daedalus_ignored']; },
        next: 'loc_zagorska_daedalus' },
      { text: '🏋 Ísť do Gym Terasový (overlay)', next: 'gym' },
      { text: '← Späť do centra', next: 'start' }
    ]
  },

  loc_zagorska_daedalus: {
    name: 'Gym // Daedalus — Optimalizácia',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    art: '🏋️',
    text: [
      '"Tréning." Pauza. "Klasika."',
      '"Analýza: tvoja forma je funkčná, nie optimálna. Mám niekoľko odporúčaní."',
      '"Odporúčanie číslo jedna: viac proteínu, menej morálnych zábrán pri výbere stravy."',
      '"Odporúčanie číslo dva: ten chlap pri tlači — Jano — má augmentovaný lakťový kĺb značky GenTech B2."',
      '"GenTech B2 má záznam šiestich zlyhaní pri záťaži nad 180kg. On dvíha 185."',
      '"Môžeš ho upozorniť. Alebo sledovať čo sa stane." Krátka pauza. "Oba scenáre sú informatívne."',
    ],
    onEnter: function(){ gainXP(8); },
    choices: [
      { text: '"Upozornim ho." [SAN +3]',
        action: function(){ S.san = Math.min(100, S.san+3); Renderer.updateStats(); addLog('Jano upozornený. SAN +3.', 'ok'); showNotif('🤝 Dobrý skutok — SAN +3'); },
        next: 'loc_zagorska' },
      { text: '"Sledujem." [XP +5, šanca na incident]',
        action: function(){
          gainXP(5);
          if (Math.random() > 0.5) { addLog('Jano: kĺb zlyhol. Bol si svedkom. Kontakt získaný.', 'warn'); S.flags['jano_incident'] = true; }
          else { addLog('Nič sa nestalo. Daedalus: Dáta zhromaždené.', 'info'); }
        },
        next: 'loc_zagorska' },
      { text: '"Máš iné rady?"', next: 'loc_zagorska_daedalus_more' },
    ]
  },

  loc_zagorska_daedalus_more: {
    name: 'Gym // Daedalus — Pokročilé metódy',
    npcName: 'DAEDALUS // AI v.4.1',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
    art: '💡',
    text: [
      '"Samozrejme. Optimalizácia výkonu má viacero vrstiev."',
      '"Vrstva jedna: legálna. Spánok, proteín, konzistentný tréning. Nudné, ale funkčné."',
      '"Vrstva dve: šedá zóna. Kortizol management, taktická dehydratácia pred testami, načasovanie kofeinového cyklu."',
      '"Vrstva tri: " Pauza. "Nelegálna ale veľmi efektívna. Nechám ťa uhádnuť obsah."',
      '"Ktorú vrstvu preferuješ? Nepýtam sa zo zvedavosti — len kalibrácia mojich odporúčaní."',
    ],
    choices: [
      { text: '"Len legálne." [SAN +2]',
        action: function(){ S.san = Math.min(100, S.san+2); Renderer.updateStats(); addLog('Daedalus: legálna optimalizácia. SAN +2.', 'info'); },
        next: 'loc_zagorska' },
      { text: '"Šedá zóna — povedz viac." [HCK závislosť]',
        cond: function(){ return (S.hackStat||10) >= 10; },
        action: function(){ S.str = Math.min(100, (S.str||10)+2); Renderer.updateStats(); addLog('Daedalus: kortizol protokol. STR +2.', 'ok'); gainXP(10); },
        next: 'loc_zagorska' },
      { text: '"Všetko tri." [Riskovať]',
        action: function(){
          if (Math.random() > 0.4) { S.str = Math.min(100, (S.str||10)+3); S.hp = Math.max(0, S.hp-10); Renderer.updateStats(); addLog('Daedalus: plný protokol. STR +3, HP -10.', 'warn'); gainXP(15); }
          else { addLog('Vedľajší efekt. HP -15.', 'err'); S.hp = Math.max(0, S.hp-15); Renderer.updateStats(); }
        },
        next: 'loc_zagorska' },
    ]
  },
  loc_zagorska_inzerat: {
    name: 'Inzerát // Kuba M.',
    art: '📋',
    text: [
      '"Hľadám partnera na sparingovanie. Nebojím sa rán. Platím 80₿/hodina alebo tovar."',
      '"Volaj na Základni alebo príď osobne — Lesopark, utorok, 14:00. — Kuba"',
      '',
      '// Kuba. To meno si si niekde čítal. Lazarusov kontakt? Alebo len náhoda? //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: '← Späť do gymu', next: 'loc_zagorska' },
      { text: '🌲 Ísť do Lesoparku', next: 'loc_lesopark' },
      { text: '🏠 Ísť na Základňu', next: 'loc_domov' }
    ]
  },
  loc_terasy: {
    name: 'Terasy pri Bojniciach',
    art: '🌿',
    text: [
      'Terasy. Ľudia tu chodia kvôli pohybu aj výhľadu. Bojnice dole, lesy nahor.',
      'Vietor od severu. Čistý vzduch — zriedkavosť v 2077. Na chvíľu zabudneš na všetko.',
      '',
      '// SAN +5 za pobyt. Hlava sa prevetrá. //',
    ],
    onEnter: function(){ S.san = Math.min(100, S.san + 5); Renderer.updateStats(); gainXP(5); addLog('Terasy: SAN +5.', 'ok'); },
    choices: [
      { text: '😌 Sediť a rozhliadať sa (SAN +5)',
        action: function(){ S.san = Math.min(100, S.san+5); Renderer.updateStats(); addLog('Výhľad: SAN +5', 'ok'); },
        next: 'loc_terasy' },
      { text: '🏃 Behať po terasách (STR +1, SAN +2)',
        action: function(){ S.str=(S.str||10)+1; S.san=Math.min(100,S.san+2); Renderer.updateStats(); addLog('Beh: STR +1, SAN +2', 'ok'); },
        next: 'loc_terasy' },
      { text: '🌱 Ísť do Záhradky (Garden overlay)',
        next: 'garden' },
      { text: '🏰 Ísť do Bojníc',
        next: 'loc_bojnice' },
      { text: '🌲 Ísť do Lesoparku',
        next: 'loc_lesopark' },
      { text: '← Späť do centra',
        next: 'start' }
    ]
  },
  loc_lesopark: {
    name: 'Lesopark',
    art: '🌲',
    text: [
      'Lesopark na okraji mesta. Ticho — také ticho, aké Prievidza 2077 môže ponúknuť.',
      'Hologramy tu nesviecia. Signál je slabý. Ideálne miesto ak nechceš byť sledovaný.',
      '',
      'Kubo spomínal, že tu zastavil v utorok o druhej. Na lavičke pri treťom strome.',
      '// [VNEM] Na kôre stromu zárez: ◆ L-2 ◆ — Lazarusov kód? //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: '🔍 Prehľadať okolie stromu s nápisom',
        next: 'loc_lesopark_strom' },
      { text: '🧘 Odpočívať v tichosti (SAN +8, HP +5)',
        action: function(){ S.san=Math.min(100,S.san+8); S.hp=Math.min(100,S.hp+5); Renderer.updateStats(); addLog('Lesopark: SAN +8, HP +5', 'ok'); },
        next: 'loc_lesopark' },
      { text: '🏠 Ísť na Základňu',
        next: 'loc_domov' },
      { text: '🌿 Ísť na Terasy',
        next: 'loc_terasy' },
      { text: '← Späť do centra',
        next: 'start' }
    ]
  },
  loc_lesopark_strom: {
    name: 'Lesopark // Zárez na strome',
    art: '🌲',
    text: [
      'Tretí strom od vstupu. Zárez v kôre: ◆ L-2 ◆',
      'Pod koreňmi — kameň, trochu odsunutý. Pod ním: zabalená vodeodolná fólia.',
      '',
      '"Ak toto čítaš, Daedalus nás odporučil. Cache bod číslo 2. Lazarusov protokol pokračuje. — X"',
      '',
      '// [QUEST] Lazarusov spis — fragment 2/5 nájdený. XP +15 //',
    ],
    onEnter: function(){
      gainXP(15);
      S.flags['lesopark_cache'] = true;
      addLog('Lazarusov cache bod 2 nájdený!', 'ok');
    },
    choices: [
      { text: '← Späť do Lesoparku', next: 'loc_lesopark' },
      { text: '📮 Ísť na Poštu za Druidom', next: 'posta' }
    ]
  },
  loc_biotech: {
    name: 'Bojnická Nemocnica // Biotech',
    art: '🏥',
    text: [
      'Nemocnica. Verejné priestory — štandardné. Dezinfekcia, biele steny, ľudia čakajúci na augment-check.',
      'Za recepciou: nové krídlo. Sklenené dvere. Bane Corp. logo. Strážnik s augmentovaným okom.',
      '',
      '// [VNEM] Bane Corp tu robí niečo s pacientmi. Nie čo písali v správach. //',
    ],
    onEnter: function(){ gainXP(5); S.flags['biotech_videny'] = true; },
    choices: [
      { text: '🏥 Kúpiť MedKit v nemocničnej lekárni (80₿)',
        cond: function(){ return S.money >= 80; },
        condFail: 'Nemáš dosť ₿',
        action: function(){ S.money -= 80; if(!S.inventory) S.inventory=[]; S.inventory.push('lekárnička'); Renderer.updateMoney(); Renderer.updateInventory(); addLog('Kúpil si MedKit.', 'ok'); },
        next: 'loc_biotech' },
      { text: '🔍 Pozorovať strážnika pri novom krídle',
        next: 'loc_biotech_kridlo' },
      { text: '🩺 Liečiť sa (HP +30, 50₿)',
        cond: function(){ return S.money >= 50; },
        condFail: 'Nemáš dosť ₿',
        action: function(){ S.money -= 50; S.hp=Math.min(100,S.hp+30); Renderer.updateStats(); Renderer.updateMoney(); addLog('Liečenie: HP +30.', 'ok'); },
        next: 'loc_biotech' },
      { text: '← Ísť k Bojnickému zámku',
        next: 'loc_bojnice' },
      { text: '← Späť',
        next: 'start' }
    ]
  },
  loc_biotech_kridlo: {
    name: 'Biotech // Nové krídlo',
    art: '🔬',
    text: [
      'Strážnik — augmentované oko skenuje každého. Na kartičke: "Bane Corp Division B — Restricted".',
      'Cez sklo vidíš biele haly, ľahí pacienti s drôtmi v zátylku. Nie dobrovoľne. Tváre prázdne.',
      '',
      '// [LAZARUS] Toto je to. Lazarusov spis hovoril o "klinike". Toto je klinika. //',
      '// XP +10 za objav. //',
    ],
    onEnter: function(){
      gainXP(10);
      S.flags['biotech_kridlo_videne'] = true;
      addLog('Objav: Bane Corp klinika v nemocnici!', 'warn');
    },
    choices: [
      { text: '📷 Odfotografovať cez sklo (XP +5)',
        cond: function(){ return !S.flags['biotech_foto']; },
        action: function(){ gainXP(5); S.flags['biotech_foto']=true; addLog('Foto zachytené. Dôkaz.', 'ok'); },
        next: 'loc_biotech_kridlo' },
      { text: '← Späť k nemocnici', next: 'loc_biotech' }
    ]
  },
  loc_bojnice: {
    name: 'Bojnický zámok',
    art: '🏰',
    text: [
      'Bojnický zámok. Turistická atrakcia — denná. V noci niečo iné.',
      'Historická fasáda, ale pod ňou — tunely z vojny. Zamknuté od roku 2031.',
      'Na bráne visí hologram: "CLOSED FOR RESTORATION — Bane Corp Heritage Division"',
      '',
      '// [VNEM] Bane Corp má aj tu prst. Tunely vedú kamsi — pod nemocnicu? //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: '🔒 Skúsiť dvere do tunelov',
        cond: function(){ return S.flags && S.flags['ma_keycards']; },
        condFail: 'Dvere sú zamknuté — potrebuješ keycard',
        next: 'loc_bojnice_tunely' },
      { text: '📸 Odfotiť hologram Bane Corp',
        action: function(){ gainXP(5); S.flags['bojnice_foto']=true; addLog('Foto: Bane Corp na zámku.', 'ok'); },
        next: 'loc_bojnice' },
      { text: '🏥 Ísť k nemocnici / Biotech',
        next: 'loc_biotech' },
      { text: '🌿 Ísť na Terasy',
        next: 'loc_terasy' },
      { text: '← Späť do centra',
        next: 'start' }
    ]
  },
  loc_bojnice_tunely: {
    name: 'Bojnický zámok // Tunely',
    art: '🕳',
    text: [
      'Dvere cedknú. Keycard zaberá. Tmavá chodba dolu.',
      'Steny z 19. storočia, káble z 21. Niekto tu inštaloval servery. Blikajúce LED pásky vedú hlboko.',
      '',
      '// [LAZARUS] Toto je podzemná infraštruktúra. Lazarusov cieľ bol niekde tu. //',
      '// XP +20 za objav. Quest: Tunely pod Bojnicami — SPLNENÝ //',
    ],
    onEnter: function(){
      gainXP(20);
      S.flags['tunely_otvorene'] = true;
      activateOp('op-jaskyne');
      addLog('Tunely objavené! Quest splnený.', 'ok');
    },
    choices: [
      { text: '← Späť na povrch', next: 'loc_bojnice' },
      { text: '📮 Reportovať Druidovi', next: 'posta' }
    ]
  },
  loc_banovce: {
    name: 'Bánovce nad Bebravou // 5G Sektor 7',
    art: '📻',
    text: ['Bánovce. Vysielač. Sektor 7.', '// Toto je cieľ. Daedalus: zdokumentuj vysielač. //'],
    onEnter: function(){ gainXP(10); S.flags['banovce_videny'] = true; activateOp('op-5g'); },
    choices: [{ text: 'Ísť na Vtáčnik', next: 'banovce_cesta' }, { text: 'Späť', next: 'start' }]
  },

  /* ═══════════════════════════════════════════════════════════════
     ╔══════════════════════════════════════════════════════════╗
     ║  FRAKCIE — LOKÁCIE A SCÉNY                              ║
     ║  4 frakcie: Stokári, Hackeri, CEO, Rybári                ║
     ║  Každá má základnú lokáciu + intro pri prvej návšteve   ║
     ╚══════════════════════════════════════════════════════════╝
  ═══════════════════════════════════════════════════════════════ */

  // ─── STOKÁRI: Garáže na okraji sídliska ──────────────────────────
  fac_stokari_garaze: {
    name: 'Stokári // Garáže Píla',
    art: '🏚',
    text: [
      'Garáže na okraji Píly. Tri rady. Každý druhý plech otvorený, dym sa motá pod žiarivkami.',
      'Z otvorenej garáže ti šplechne hudba — basa pulzuje cez kovovú stenu.',
      '',
      '// [VNEM] Páska na zemi okolo skladu. Stokárska. Na zemi prázdne ampulky Gentech B2 — //',
      '// red. Niekto si dnes dal viac ako mal. Tri sedačky z auta, lampa, plotter na obvody. //',
      '// Toto je hlavná diera. Tu sa stretávajú. Tu sa rozhodujú. //',
      '',
      'Pri tretej garáži sedí Ferko — toho už poznáš. A vedľa neho dievča, ostrá tvár, augment v krku.',
      '"Pozri kto sa otelil. Vyzeráš ako že hľadáš niečo."',
    ],
    onEnter: function(){
      addLog('Vstup do Stokárskeho hub-u — Garáže Píla.', 'ok');
    },
    choices: [
      { text: '"Hľadám deal." [otázka na minihru]',
        next: 'fac_stokari_minihra_intro' },
      { text: '"Chcel by som sa pridať." [JOIN frakcia]',
        next: 'fac_stokari_join_check' },
      { text: '(Len sa rozhliadnuť) [OBSERVÁCIA]',
        next: 'fac_stokari_observe' },
      { text: '← Späť na námestie',
        next: 'start' }
    ]
  },

  fac_stokari_join_check: {
    name: 'Stokári // Pozývanie',
    art: '🏚',
    text: [
      'Ferko si ťa premeria. Dievča vedľa neho — Karina — sa ani nepohne.',
      '"Pridať sa? Tu nie je klub kde si dáš pasovku. Robíš jeden deal s nami, ukážeš že nesypeš na cop, a si vnútri."',
      '',
      'Karina si zapáli. Pohlad ostrý.',
      '"Alebo nemusíš robiť nič. Niekedy stačí byť tu. A ne-vidieť veci ktoré nie sú pre teba."',
      '',
      '// [VOĽBA] Stokárov môžeš joinnúť hneď — pasívny príjem 10₿/s. //',
      '// Ale stratíš odstup. //',
    ],
    choices: [
      { text: '"Som dnu. Čo robíme?" [JOIN — Stokári]',
        next: 'fac_stokari_joined',
        action: function(){ FactionsSystem.join('stokari'); } },
      { text: '"Najprv chcem skúsiť deal." [Minihra ako test]',
        next: 'fac_stokari_minihra_intro' },
      { text: '"Nechám si to ešte premyslieť." [Späť]',
        next: 'fac_stokari_garaze' }
    ]
  },

  fac_stokari_joined: {
    name: 'Stokári // Vitaj v rodine',
    art: '🏚',
    text: [
      'Karina sa konečne usmeje — krátko, ako keď trafíš v páčku.',
      '"Dobre. Si jeden z nás. Tvoja zložka v sieti je čistá od dnes — Sirota tomu hovoríme. Žiadny otec, žiadny štát."',
      '',
      'Ferko ti hodí kľúč od garáže 14. "Tvoja. Necháme tam veci na tvoju ruku."',
      '',
      '// ▲ JOIN: Stokári · Pasívny príjem 10₿/s aktívny //',
      '// ▲ Reputácia: 5/100 //',
      '// ▲ Prístup k Stokárskym questom a minihre Street Deal //',
    ],
    onEnter: function(){
      gainXP(20);
      addLog('Frakcia: Stokári JOINED. Príjem +10₿/s.', 'ok');
    },
    choices: [
      { text: '"Aký prvý kšeft?" [Quest: Vyber dlžobu od dílera]',
        next: 'fac_stokari_quest_intro' },
      { text: '"Skús ten deal" [Minihra: Street Deal]',
        next: 'fac_stokari_minihra_intro' },
      { text: '← Späť',
        next: 'fac_stokari_garaze' }
    ]
  },

  fac_stokari_minihra_intro: {
    name: 'Stokári // Street Deal',
    art: '💊',
    text: [
      'Karina kývne hlavou smerom k pareniete pri 7-ke.',
      '"Klient. Občan. Chce kúpiť ale je nervózny. Musíš trafiť moment kedy ti dá kredit — preťahuj prsty cez ihličku indikátora keď bude v zelenej zóne. Príliš skoro = nedôvera. Príliš neskoro = spadne ti to."',
      '',
      '// [MINIHRA] Klikni keď je indikátor v zelenej zone — pohyb sa zrýchľuje s každým úspešným dealom. //',
      '// Reward: peniaze + reputácia, fail: −SAN, +podozrenie copov. //',
    ],
    choices: [
      { text: '🟢 Spustiť minihru [Street Deal]',
        action: function(){ if (typeof StreetDealMinigame !== 'undefined') StreetDealMinigame.open(); else showNotif('Minihra bude dostupná v Etape 2'); },
        next: 'fac_stokari_garaze' },
      { text: '← Neskôr',
        next: 'fac_stokari_garaze' }
    ]
  },

  fac_stokari_observe: {
    name: 'Stokári // Pozorovanie',
    art: '🏚',
    text: [
      'Stojíš pri múre. Nikto si ťa nevšíma — alebo predstierajú že nie.',
      '',
      '// [VNEM] Schéma: každých 11 minút prejde modré BMW. Bez SPZky. Vodič rovnaký každú //',
      '// pasáž. Toto je rotácia — niekto kontroluje obvod proti copom. Nie sú to amatéri. //',
      '',
      '// [EMPATIA] Tí ľudia sú mladí. Augmenty lacné, druhé generácie. Toto nie je glamour, //',
      '// je to pretrvanie. //',
      '',
      '// ▲ XP +10 — observačná misia //',
    ],
    onEnter: function(){ gainXP(10); S.flags['stokari_observed'] = true; },
    choices: [{ text: '← Vrátiť sa k entry', next: 'fac_stokari_garaze' }]
  },

  // ─── HACKERI: FIT laboratórium B7 ─────────────────────────────────
  fac_hackers_lab: {
    name: 'Hackeri // Lab B7 — FIT',
    art: '💻',
    text: [
      'Laboratórium B7. Dverá s biometrikom, sklo zatemnené, zvnútra pulzuje cyan svetlo.',
      'Oravec na teba čaká pri terminále. Tri obrazovky, jeden Wireshark, jedna rozpísaná diplomka, jedna — Reuters live feed o 5G blacklistoch.',
      '',
      '"Sadni si. Nie som učiteľ teraz, som — niečo iné."',
      '"Toto miesto nie je v zozname predmetov. Komisia tu zatvorila etiku. Etika sa odsťahovala — my sme to obsadili."',
      '',
      '// [VNEM] B7 je nelegálny. Vidíš škrabance na záme, kameru pretiahnutú farbou. //',
      '// Decentralizovaný hub. Šestci ľudí. Možno 10. Operujú v noci. //',
    ],
    onEnter: function(){
      addLog('Vstup do FIT Lab B7 — Hackerský hub.', 'ok');
    },
    choices: [
      { text: '"Pridám sa." [JOIN — Hackeri]',
        next: 'fac_hackers_joined',
        action: function(){ FactionsSystem.join('hackers'); } },
      { text: '"Čo tu robíte?" [Otázka pred join]',
        next: 'fac_hackers_explain' },
      { text: '"Skúsim terminal." [Minihra]',
        next: 'fac_hackers_minihra_intro' },
      { text: '← Späť na FIT',
        next: 'loc_fri' }
    ]
  },

  fac_hackers_explain: {
    name: 'Hackeri // Vysvetlenie',
    art: '💻',
    text: [
      'Oravec si zložil okuliare. Pretiera ich.',
      '"LAZARUS je len jedna fáza. Bane Corp. má kontrakt, štát to neprizná, FRI to vie. My — robíme audit. Bez povolenia. Niekedy aj viac."',
      '',
      '"Hackneme infraštruktúru. Vyleakujeme. Vyrábame whitepapery z toho čo vyleakujeme."',
      '"Niektorí to volajú aktivizmus. Niektorí terorizmus. Ja to volám — práca."',
      '',
      '"Si dnu — máš prístup k Lab B7, k terminálom, k peniazom z tvorby exploitov. 10₿/s pasívne."',
      '"Si vonku — nikdy si tu nebol."',
    ],
    choices: [
      { text: '"Som dnu." [JOIN — Hackeri]',
        next: 'fac_hackers_joined',
        action: function(){ FactionsSystem.join('hackers'); } },
      { text: '← Premyslím si to',
        next: 'fac_hackers_lab' }
    ]
  },

  fac_hackers_joined: {
    name: 'Hackeri // Membership Active',
    art: '💻',
    text: [
      'Oravec ti podá dlaň. Jeho stisk je pevný — ako u niekoho kto nervóznosť skrýva v rukách.',
      '"Vitaj. Tvoj handle bude... nech tipnem... rozhodneš si sám neskôr. Teraz si jeden zo siete."',
      '',
      'Cyan LED na terminále zamení farbu na zelenú. Ďalšia obrazovka sa zapne.',
      '',
      '// ▲ JOIN: Hackeri · Pasívny príjem 10₿/s aktívny //',
      '// ▲ Reputácia: 5/100 //',
      '// ▲ Prístup k Terminal Ops minihre + hackerským questom //',
      '// ▲ +1 hackStat za každú splnenú minihru //',
    ],
    onEnter: function(){
      gainXP(20);
      addLog('Frakcia: Hackeri JOINED. Príjem +10₿/s.', 'ok');
    },
    choices: [
      { text: '"Prvý quest?" [Quest: Hackni FIT a uprav známky]',
        next: 'fac_hackers_quest_intro' },
      { text: '"Terminal" [Minihra: Terminal Ops]',
        next: 'fac_hackers_minihra_intro' },
      { text: '← Odísť',
        next: 'fac_hackers_lab' }
    ]
  },

  fac_hackers_minihra_intro: {
    name: 'Hackeri // Terminal Ops',
    art: '💻',
    text: [
      'Oravec ti naukáže na 4. obrazovku.',
      '"Sequence challenge. Najprv ľahké — len si zachytíš tempo. Potom budeš musieť čítať protokol."',
      '"Reward: peniaze, hackStat, reputácia. Fail: nič — len strata času."',
      '',
      '// [MINIHRA] Zopakuj sekvenciu znakov ktorú ti server pošle. //',
      '// Tempo sa zrýchľuje. Čím viac levelov, tým väčší reward. //',
    ],
    choices: [
      { text: '🟢 Spustiť Terminal Ops',
        action: function(){ if (typeof TerminalOpsMinigame !== 'undefined') TerminalOpsMinigame.open(); else showNotif('Minihra bude dostupná v Etape 2'); },
        next: 'fac_hackers_lab' },
      { text: '← Neskôr',
        next: 'fac_hackers_lab' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  //  MICHAL — Sarkastický génius, dlhoročný kamarát, Miki Bar okolie
  //  Quest reťazec: Stretnutie → Byt → Bane Corp hook → Join Hackeri
  // ═══════════════════════════════════════════════════════════════

  // ── Prvé narazenie — vonku pred Miki Barom ──────────────────────
  michal_encounter: {
    name: 'Miki Bar // Ulica — Ranné ráno',
    art: '🚬',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Vychádzaš z Miki Baru. Štyri ráno. Ulica mokrá.',
      '',
      'Niekto sedí na zábradlí oproti. Notebook na kolenách, cigareta v ústach.',
      'Mikina s kapucňou napriek horúčave. Tvár skrytá.',
      '',
      'Potom sa otočí.',
      '',
      '"Hej." Krátke. Ako keby ste sa videli včera.',
      '',
      '// Michal. Základka. Desať rokov bez kontaktu. //',
      '// A sedí tu, vonku pred Miki Barom, o štvrtej ráno, s notebookom. //',
      '// Samozrejme. //',
    ],
    onEnter: function(){
      gainXP(20);
      S.flags['michal_stretnuty'] = true;
      addLog('Michal nájdený — pred Miki Barom.', 'ok');
      showNotif('🔵 Nová postava: Michal');
    },
    choices: [
      { text: '"Michal? Čo ty tu robíš?"', next: 'michal_co_tu_robis' },
      { text: '"Dlho sme sa nevideli." [Ticho]', next: 'michal_dlho_nevideli' },
      { text: '[Ignorovať — ísť preč]', next: 'loc_miki' },
    ]
  },

  michal_co_tu_robis: {
    name: 'Miki Bar // Ulica — Rozhovor',
    art: '🚬',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Čo robím." Zopakuje otázku. Pomaly. Ako keby skúmal či si to myslíš vážne.',
      '"Pracujem." Kývne na notebook.',
      '"No a ty — čo ty robíš v tomto meste? Myslel som, že si odišiel."',
      '',
      'Cigaretový dym. Čaká.',
      '',
      '// [VNEM] Tón: nie nepriateľský. Len sarkastický reflex. //',
      '// Prečítaš v ňom — je unavený. Ale nie spánkom. //',
    ],
    onEnter: function(){ gainXP(10); },
    choices: [
      { text: '"Vrátiť sa. Niečo sa deje tu."', next: 'michal_nieco_sa_deje' },
      { text: '"Povedz mi čo robíš ty."',       next: 'michal_co_robis_ty' },
    ]
  },

  michal_dlho_nevideli: {
    name: 'Miki Bar // Ulica — Ticho',
    art: '🚬',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michalu to ticho neprekáža.',
      '"Desať rokov." Otvorí terminál. "Mal som počítať."',
      '"Tu si bol vždy, keď si mal byť niekde inde."',
      '',
      'Nie výčitka. Konštatovanie.',
      '"Poď. Mám ešte kafé."',
      '',
      '// Vedieš sa. Tak to vždy bolo. //',
    ],
    onEnter: function(){ gainXP(10); },
    choices: [
      { text: '[Ísť s ním]', next: 'michal_byt_vstup' },
    ]
  },

  michal_nieco_sa_deje: {
    name: 'Miki Bar // Ulica — LAZARUS',
    art: '🚬',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Niečo sa deje."',
      'Dlhá pauza. Michal zhasí cigaretu.',
      '"Áno." Bez prekvapenia. "Viem."',
      '',
      '"LAZARUS protokol. Bane Corp. Uzly. To?" Pozrie sa na teba.',
      '"Vítaj v klube. Mal by si prísť hore — mám niečo čo by si mal vidieť."',
      '"Ale najprv mi povedz — odkiaľ vieš o tom mene."',
    ],
    onEnter: function(){ gainXP(15); S.flags['michal_vie_o_lazarus'] = true; },
    choices: [
      { text: '"Druid mi povedal."',            next: 'michal_druid_hook' },
      { text: '"Zistil som sám."',              next: 'michal_byt_vstup' },
      { text: '"Nechaj to. Ukáž mi čo máš."',  next: 'michal_byt_vstup' },
    ]
  },

  michal_co_robis_ty: {
    name: 'Miki Bar // Ulica — Práca',
    art: '🚬',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Čo robím ja."',
      '"Siedmy rok tu bývam. Byt hore — číslo 4B. Vieš kde."',
      '',
      '"Monitorujem siete. Mestské. Korporátne. Niektoré ktoré — by som nemal."',
      '"Platia dobre. A informácie platia ešte lepšie."',
      '',
      'Zavre notebook. Vstane.',
      '"Bane Corp. má leak vo firewall čo nevedeli šesť mesiacov."',
      '"Ja ho viem tri."',
      '',
      '// Hovorí to bez dramatiky. Ako keby ti povedal počasie. //',
    ],
    onEnter: function(){ gainXP(15); S.flags['michal_bane_leak_zmienka'] = true; },
    choices: [
      { text: '"Poď hore. Chcem vedieť viac."', next: 'michal_byt_vstup' },
      { text: '"Bane Corp leak — to je nebezpečné."', next: 'michal_nebezpecne' },
    ]
  },

  michal_druid_hook: {
    name: 'Miki Bar // Ulica — Druid',
    art: '🚬',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Druid." Tichý smiech. "Samozrejme."',
      '"Ten starý človek chodí po meste a myslí si že je neviditeľný.",',
      '"Niet tu človeka kto by ho nevidel — ale nechám mu to."',
      '',
      '"Druid vie vrch. Ja viem spodok."',
      '"Poď hore. Dám ti kontekst čo ti Druid nedal."',
    ],
    onEnter: function(){ gainXP(10); },
    choices: [
      { text: '[Ísť hore do bytu]', next: 'michal_byt_vstup' },
    ]
  },

  michal_nebezpecne: {
    name: 'Miki Bar // Ulica — Riziko',
    art: '🚬',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Nebezpečné." Opakuje slovo. Testuje ho.',
      '"Áno, je. A?"',
      '"Preto som nešiel hlbšie." Prvý raz niečo iné v hlase. Nie sarkazmus.',
      '"Viem kam to vedie. Videl som iných čo šli."',
      '"Nevrátili sa. Alebo sa vrátili — iní."',
      '',
      '// SAN -3. Prvý záblesk čo to pre neho znamená. //',
    ],
    onEnter: function(){ S.san = Math.max(0, S.san-3); Renderer.updateStats(); gainXP(10); addLog('Michal: vidia tých čo idú príliš hlboko.','warn'); },
    choices: [
      { text: '"Preto tu som ja." [Ísť hore]', next: 'michal_byt_vstup' },
      { text: '"Čo sa im stalo?"',              next: 'michal_co_sa_im_stalo' },
    ]
  },

  michal_co_sa_im_stalo: {
    name: 'Miki Bar // Ulica — Zmiznutí',
    art: '🚬',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Dvaja." Dlhá pauza.',
      '"Jeden pracoval so mnou. Dostal sa do HR databázy Bane Corp."',
      '"Druhý týždeň — hospitalizovaný. Záhadná neurologická príhoda."',
      '"Tretí týždeň — pracuje pre Bane Corp. Hovorí že nikdy nehackoval."',
      '',
      '"Druhý — proste zmizol. Číslo nedostupné. Byt prázdny. Rodina hovorí že odišiel do zahraničia."',
      '"Rodina hovorí to čo im povedali povedať."',
      '',
      '// BIO-ECHO. Nehovorí to. Ale vieš. //',
    ],
    onEnter: function(){ S.san = Math.max(0, S.san-5); Renderer.updateStats(); gainXP(15); S.flags['michal_zmiznuty_hack'] = true; addLog('SAN -5. Hackeri čo šli príliš hlboko — zmizli.','warn'); },
    choices: [
      { text: '[Ísť hore do bytu]', next: 'michal_byt_vstup' },
    ]
  },

  // ── Michalov byt — 4B, Miki okolie ─────────────────────────────
  michal_byt_vstup: {
    name: 'Miki Bar // Byt 4B — Chodba',
    art: '🏠',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Štvrtý poschodie. Staré schodisko. Žiarovka bliká.',
      '',
      'Dvere 4B — bez menovky. Dva zámky. Na dverách tichý malý stiker: 👁',
      '',
      'Michal otvorí bez slova. Vy ste dnu.',
      '',
      '// Byt: 40m². Ale vnútri — oveľa väčší. Väčší ako by mal byť. //',
      '// Tri monitory. Jeden veľký, dva bočné. Všetky zapnuté. //',
      '// Neóny z ulice svietia cez žalúzie — modrá, zelená, červená. //',
      '// Na podlahe — pizzové škatule, káblové zväzky, jeden starý router s anténou. //',
    ],
    onEnter: function(){ gainXP(15); S.flags['michal_byt_navstiveny'] = true; addLog('Michalov byt: 4B pri Miki Bare.','ok'); },
    choices: [
      { text: '"Čo ti tie monitory ukazujú?"',  next: 'michal_monitory' },
      { text: '"Spomínal si Bane Corp leak."',  next: 'michal_byt_bane_corp' },
      { text: '"Prečo bývaš práve tu?"',         next: 'michal_preco_tu' },
    ]
  },

  michal_preco_tu: {
    name: 'Miki Bar // Byt 4B — Lokácia',
    art: '🏠',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Prečo tu." Verí si kávu.',
      '"Lebo tu ich není. Nezaujímajú ich ľudia čo žijú pri Miki Bare."',
      '"Predpokladajú — alkoholitci, dlžníci, bezdomovci v prenájme."',
      '"Nikto nekontroluje sieťovú prevádzku z tejto časti mesta."',
      '',
      '"Plus" — kývne na okno — "dobré UFO pozorovanie."',
      '"Každý piatok, asi o jednej, niečo robí slučku nad Bojnicami."',
      '"Nezdokumentované. Tiché. Tepelný podpis — nie lietadlo."',
      '',
      '// [FLAG] michal_ufo — relevantné pre neskorší quest //',
    ],
    onEnter: function(){ gainXP(10); S.flags['michal_ufo_pozoruje'] = true; addLog('Michal: UFO slučky nad Bojnicami — každý piatok.','info'); },
    choices: [
      { text: '"Čo ti tie monitory ukazujú?"', next: 'michal_monitory' },
      { text: '"Bane Corp leak."',             next: 'michal_byt_bane_corp' },
    ]
  },

  michal_monitory: {
    name: 'Miki Bar // Byt 4B — Monitory',
    art: '💻',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Stredný monitor: sieťová mapa. Uzly, spojenia, farby.',
      'Jeden uzol pulzuje červeno. Označený: <b>LAZARUS-7 // VENDELIN</b>',
      '',
      'Ľavý: log stream. Stovky riadkov za sekundu.',
      'Pravý: satelitný snímok. Nočný. Bojnická oblasť.',
      '',
      '"Toto." Ukáže na červený uzol.',
      '"Sedem mesiacov to sledujem. Bane Corp. server farma — legálne. Tu."',
      '"Ale toto nie je server farma. Toto je niečo iné."',
      '"Energetická spotreba zodpovedá... možno vojenský radar. Možno viac."',
      '',
      '// HCK +2 — vidíš čo vidí on. //',
    ],
    onEnter: function(){ S.hackStat = Math.min(100, S.hackStat+2); Renderer.updateStats(); gainXP(20); S.flags['michal_ukazal_mapu'] = true; addLog('Michal: LAZARUS-7 Vendelin mapa. HCK +2.','ok'); },
    choices: [
      { text: '"Prečo si neišiel hlbšie?"',  next: 'michal_preco_nie_hlbsie' },
      { text: '"Môžem sa pozrieť na log?"',  next: 'michal_log_prístup' },
    ]
  },

  michal_preco_nie_hlbsie: {
    name: 'Miki Bar // Byt 4B — Strach',
    art: '💻',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Tichšie teraz.',
      '"Lebo viem čo je za tou stenou."',
      '"Nie metaforicky. Reálne. Protokol BIO-ECHO."',
      '"Keď prekročíš perimeter — systém ťa označí. Biologicky."',
      '"Skenuje teplo, srdcový rytmus, vzor pohybu."',
      '"Keď ťa označí — vieš o tom až keď je neskoro."',
      '',
      'Otočí sa k tebe.',
      '"Ale ty." Pauza. "Ty si tu preto, aby si išiel."',
      '"Ja ti dám cestu dnu. Ty mi prinesieš to čo nájdeš."',
      '"Fair?"',
      '',
      '// Toto je core deal s Michalom. //',
    ],
    onEnter: function(){ gainXP(25); S.flags['michal_deal_ponuka'] = true; addLog('Michal: ponúka prístup — ty ideš, on naviguje.','ok'); },
    choices: [
      { text: '"Fair. Čo potrebujem?"',           next: 'michal_byt_bane_corp' },
      { text: '"Potrebujem čas na rozmyslenie."', next: 'michal_byt_odchod' },
    ]
  },

  michal_log_prístup: {
    name: 'Miki Bar // Byt 4B — Log Stream',
    art: '💻',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Sadáš si. Log stream.',
      '',
      'Stovky riadkov. Ale niečo zaujme:',
      '<b>[02:34:17] BANE-INTERNAL :: user_auth :: delta_probe :: STATUS: ACTIVE</b>',
      '<b>[02:34:19] BIO-ECHO v2 :: sweep :: sector_VEND :: anomaly_count: 0</b>',
      '<b>[02:34:22] LAZARUS-CMD :: heartbeat :: nodes: 7/7 :: GREEN</b>',
      '',
      '"delta_probe." Hovoríš nahlas.',
      'Michal sa otočí rýchlo. "Kde si to videl?"',
      'Ukážeš mu. Dlhá mlčanlivosť.',
      '"To meno... to som nevidel predtým. To je nové."',
    ],
    onEnter: function(){
      gainXP(30); S.hackStat = Math.min(100, S.hackStat+3);
      Renderer.updateStats(); S.flags['delta_probe_objaveny'] = true;
      addLog('delta_probe objavený v Bane Corp. logu. HCK +3.','warn');
      showNotif('⚠ delta_probe — nová LAZARUS premenná!');
    },
    choices: [
      { text: '"Čo je delta_probe?"',           next: 'michal_delta_probe' },
      { text: '"Povedz mi o Bane Corp. leaku."', next: 'michal_byt_bane_corp' },
    ]
  },

  michal_delta_probe: {
    name: 'Miki Bar // Byt 4B — Delta Probe',
    art: '💻',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"delta_probe." Píše rýchlo. Vyhľadáva vo vlastnom archíve.',
      '"Nenachádzam. Nie je v žiadnom leaku čo som mal."',
      '"Čo znamená — buď je nové, alebo bolo skryté pred mojou úrovňou prístupu."',
      '',
      '"Probe — sonda. Delta — štvrtá fáza alebo označenie agenta."',
      '"Ak si ty Agent Delta z toho zoznamu..." Zastaví sa.',
      '"...tak toto je aktívne sledovanie. Teba."',
      '',
      '// SAN -5. Zoznam LAZARUS + delta_probe + BIO-ECHO = skladačka sa skladá. //',
      '// Ak máš flag lazarus_zoznam — vieš čo to znamená. //',
    ],
    onEnter: function(){
      S.san = Math.max(0, S.san-5); Renderer.updateStats(); gainXP(20);
      S.flags['michal_delta_teoria'] = true;
      addLog('SAN -5. delta_probe = sledovanie Agenta Delta — teba.','warn');
    },
    choices: [
      { text: '"Potrebujem prístup do Bane Corp. siete."', next: 'michal_byt_bane_corp' },
      { text: '"Musím zastaviť LAZARUS."', next: 'michal_byt_bane_corp' },
    ]
  },

  // ── Bane Corp hook — jadro Michalovho questu ────────────────────
  michal_byt_bane_corp: {
    name: 'Miki Bar // Byt 4B — Bane Corp Leak',
    art: '🔓',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Bane Corp." Sadá si. Prvý raz vážne — bez sarkazmu.',
      '"Firewall má medzeru v autentifikácii pre starý servisný port."',
      '"Port 8822. Zostal otvorený od migrácie v 2071."',
      '"Viem tam dostať read-only prístup. Bez alarmu."',
      '"Write prístup — iná vec. Tam ide alarm okamžite."',
      '',
      '"Ale." Pauza. "Read prístup mi nestačil. Potrebujem niekoho vo vnútri."',
      '"Fyzicky. V serverovni. Aby mi dal hash správcu."',
      '"Ten hash mi dá write prístup. A write prístup..." Usmieva sa.',
      '"...write prístup mi dá celý LAZARUS."',
      '',
      '// Quest: Dostať sa fyzicky do Bane Corp. serverovne — pre Michala. //',
      '// Reward: Michal ti dá write prístup → nová endgame možnosť zastaviť LAZARUS hackingom. //',
    ],
    onEnter: function(){
      gainXP(30); S.flags['michal_bane_quest_aktívny'] = true;
      addLog('QUEST: Fyzický prístup do Bane Corp. serverovne pre Michala.','warn');
      showNotif('📋 Nový quest: Bane Corp. Serverovňa');
    },
    choices: [
      { text: '"Pomôžem ti. Kde je serverovňa?"',         next: 'michal_serverovna_info' },
      { text: '"Najprv chcem — joinúť Hackerov cez teba."', next: 'michal_hackeri_join_via' },
      { text: '"Nechaj ma to premyslieť."',               next: 'michal_byt_odchod' },
    ]
  },

  michal_serverovna_info: {
    name: 'Miki Bar // Byt 4B — Mapa Serverovne',
    art: '🗺️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Serverovňa." Otvára nový tab. Schéma budovy.',
      '"Bane Corp. — Bojnická nemocnica. Nové krídlo. Suterén, úroveň -2."',
      '"Viditeľne: technická miestnosť HVAC. Reálne: server cluster."',
      '"Prístup: service entrance, karta úrovne B2 alebo vyššie."',
      '',
      '"Kartu môžeš dostať dvoma spôsobmi."',
      '"Jeden — ukradnúť od technika. Sú tam každú stredu."',
      '"Dva — Oravec na FRI. Má kontakt v nemocnici."',
      '"Ale Oravca neprosí len tak hocikto..."',
      '',
      '// Prepojenie: Oravec → FRI → Hackeri. Michal → iná cesta k tomu istému cieľu. //',
    ],
    onEnter: function(){
      gainXP(20); S.flags['bane_serverovna_mapa'] = true;
      addLog('Serverovňa: Bojnická nemocnica, B2. Karta alebo Oravec.','ok');
    },
    choices: [
      { text: '"Joinúť Hackerov — Oravec bude vedieť."', next: 'michal_hackeri_join_via' },
      { text: '"Idem sám — ukradnem kartu."',
        cond: function(){ return S.str >= 25; }, condFail: 'SIL 25+ potrebná na akciu.',
        next: 'michal_serverovna_karta' },
      { text: '"Vrátiť sa neskôr."', next: 'michal_byt_odchod' },
    ]
  },

  michal_serverovna_karta: {
    name: 'Bojnická Nemocnica // Technik',
    art: '🏥',
    text: [
      'Streda. Servisný vchod. Technik príde o deviatej.',
      '',
      'Čakáš. Pätnásť minút. Dvadsať.',
      'Príde. Šedá kombinéza, B2 karta viditeľne na opasku.',
      '',
      'Rýchle rozhodnutie. Zrážka v chodbe. Ospravedlnenie. Odchádza.',
      'Karta — v tvojej ruke.',
      '',
      '// Michal dostane hash. Quest posúva sa. //',
    ],
    onEnter: function(){
      gainXP(35); addItem('b2_karta'); S.flags['bane_karta_ziskana'] = true;
      addLog('B2 karta získaná — Bane Corp. serverovňa prístupná.','ok');
      showNotif('🔑 B2 Karta získaná!');
    },
    choices: [
      { text: '[Zavolať Michalovi]', next: 'michal_bane_hash' },
    ]
  },

  michal_bane_hash: {
    name: 'Miki Bar // Byt 4B — Hash',
    art: '🔓',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michal otvára dvere skôr ako zaklopíš.',
      '"Mal si to rýchlo." Vezme kartu. Skenuje. Píše.',
      '',
      'Päť minút ticha. Terminál. Stovky príkazov.',
      '',
      '"Hotovo." Otočí sa. "Mám hash. Write prístup aktívny."',
      '"LAZARUS infraštruktúra je... rozsiahlejšia ako som čakal."',
      'Dlhé ticho.',
      '"Ale môžem to zastaviť. Potrebujem hodinu — a ty musíš byť vonku z mesta."',
      '"Pre prípad že si sledovaný."',
      '',
      '// ▲ MAJOR FLAG: michal_write_pristup = true //',
      '// Otvorí sa nová endgame možnosť: LAZARUS zastaviť hackingom bez fyzického bunkra //',
    ],
    onEnter: function(){
      gainXP(60); S.hackStat = Math.min(100, S.hackStat+8);
      Renderer.updateStats(); S.flags['michal_write_pristup'] = true;
      S.flags['lazarus_hack_moznost'] = true;
      addLog('Michal má write prístup do Bane Corp. LAZARUS hack možný. HCK +8.','ok');
      showNotif('⚡ LAZARUS hack možnosť odomknutá!');
    },
    choices: [
      { text: '"Zastaviť LAZARUS hackingom — cez Michala"', next: 'michal_lazarus_hack_path' },
      { text: '"Radšej pôjdem fyzicky — do bunkra."',        next: 'bunker',
        cond: function(){ return hasItem('keycard') && hasItem('spis'); },
        condFail: 'Potrebuješ keycard + spis OMEGA.' },
    ]
  },

  michal_lazarus_hack_path: {
    name: 'Prievidza // LAZARUS Shutdown — Hack',
    art: '💀',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michal píše. Ty čakáš vonku na ulici.',
      '',
      'Dvadsať minút. Štyridsať. Hodina.',
      'Telefón vibruje. Správa:',
      '"<b>UZLY 1-6: OFFLINE. UZOL 7 — MÁ FYZICKÚ ZÁLOHU. NEDÁ SA DIAĽKOVO.</b>"',
      '"<b>Uzol 7 = Vendelin. Musíš ísť tam fyzicky.</b>"',
      '"<b>Ale ostatných 6 — sú dole. Prievidza je čistá.</b>"',
      '',
      '// Čiastočné víťazstvo — cez Michala. //',
      '// Uzol 7 ostáva — vedie k finálnej scéne na Vendelíne. //',
    ],
    onEnter: function(){
      gainXP(80); S.money += 500; Renderer.updateMoney();
      S.flags['lazarus_6_offline'] = true;
      addLog('LAZARUS uzly 1-6 offline — Michal. Uzol 7 Vendelin zostáva.','ok');
      showNotif('⚡ 6/7 uzlov LAZARUS offline!');
    },
    choices: [
      { text: '"Ísť na Vendelin — uzol 7."', next: 'banovce_cesta' },
    ]
  },

  // ── Join Hackeri cez Michala — alternatíva k Oravcovi ───────────
  michal_hackeri_join_via: {
    name: 'Miki Bar // Byt 4B — Hackeri Pozvánka',
    art: '💻',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Hackeri." Opakuje. Nie otázka.',
      '"Oravec ich vedie. Dobrý človek. Trochu — akademický."',
      '"Nič zlé, ale — myslí v konferenčných paperoch, nie v exploitoch."',
      '',
      '"Ja nie som člen. Nikdy som nebol." Pauza. "Ale poznám heslo."',
      '"Ak chceš — dám ti odporúčanie. Oravec to pozná."',
      '"Povie ti že som — neoficiálny kontakt. Tak to hovorí."',
      '',
      '"Lab B7. FIT. Povedz mu že ťa poslal M."',
      '"Len M. Nič viac. On bude vedieť."',
    ],
    onEnter: function(){
      gainXP(20); S.flags['michal_hackeri_odporucanie'] = true;
      addLog('Michal: odporúčanie na Hackerov cez Oravca — "M."','ok');
      showNotif('🔵 Odporúčanie: Hackeri — Lab B7, FIT');
    },
    choices: [
      { text: '[Ísť na FIT — Lab B7]', next: 'fac_hackers_lab' },
      { text: '"Ešte zostaneš tu chvíľu?"', next: 'michal_byt_zostatok' },
    ]
  },

  michal_byt_zostatok: {
    name: 'Miki Bar // Byt 4B — Pred odchodom',
    art: '🏠',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Zostaneš."',
      'Michal nerozmýšľa. Otvorí chladničku. Dve pivá.',
      '"Mám tu niečo čo si musíš pozrieť pred tým ako ideš."',
      '',
      'Otvára archívnu zložku. Fotky. Nočné snímky z okna.',
      'Nad Bojnicami — svetlo. Pohybuje sa. Ticho. Kruhy.',
      '"Každý piatok. Bez výnimky. Siedmy mesiac."',
      '"Koordinujem s piatimi ľuďmi v okolí. Všetci vidia to isté."',
      '"Nikto to nehlási. Lebo — komu?"',
      '',
      '// SAN +3 — nie strach. Akceptácia. //',
    ],
    onEnter: function(){
      S.san = Math.min(100, S.san+3); Renderer.updateStats();
      gainXP(15); S.flags['michal_ufo_dokumentacia'] = true;
      addLog('SAN +3. Michalov UFO archív — 7 mesiacov dát.','info');
    },
    choices: [
      { text: '[Odísť na FIT]', next: 'fac_hackers_lab' },
      { text: '[Odísť neskôr — späť do mesta]', next: 'start' },
    ]
  },

  michal_byt_odchod: {
    name: 'Miki Bar // Byt 4B — Odchod',
    art: '🏠',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Dobre." Michal sa otočí späť k monitoru.',
      '"Vieš kde ma nájdeš."',
      '',
      'Nič viac. Toto je jeho spôsob. Vždy bol.',
      '',
      '// Byt 4B zostáva dostupný — môžeš sa vrátiť kedykoľvek. //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: '[Späť do mesta]',       next: 'start' },
      { text: '[Späť do Miki Baru]',   next: 'loc_miki' },
    ]
  },

  // ── Priamy vstup do bytu (vraciaš sa) ───────────────────────────
  michal_byt_navrat: {
    name: 'Miki Bar // Byt 4B — Návrat',
    art: '🏠',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Dvere 4B. Zaklopíš.',
      '"Otvorené." Hlasnejšie ako čakaš.',
      '',
      'Michal je tam kde si ho nechal. Monitor. Káva. Cigareta.',
      '"Čo je nové?"',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: '"Serverovňa."',
        cond: function(){ return S.flags['michal_bane_quest_aktívny'] && !S.flags['bane_karta_ziskana']; },
        condFail: '',
        next: 'michal_serverovna_info' },
      { text: '"Máš čas na Hackerov?"',
        cond: function(){ return !S.flags['michal_hackeri_odporucanie']; },
        condFail: '',
        next: 'michal_hackeri_join_via' },
      { text: '"Chcem sa pozrieť na monitory."', next: 'michal_monitory' },
      { text: '"Choď na penthouse — potrebujem s tebou hovoriť."', next: 'michal_penthouse_vstup' },
      { text: '[Odísť]', next: 'start' },
    ]
  },


  // ╔═══════════════════════════════════════════════════════════════╗
  // ║  MICHALA PENTHOUSE — Bojnická 17, 12. poschodie              ║
  // ║  Anonymný prenájom. Výrivka. Rack-server. Výhľad na Bojnice. ║
  // ╚═══════════════════════════════════════════════════════════════╝
  michal_penthouse_vstup: {
    name: 'Bojnická 17 // Penthouse — Vstup',
    art: '🌃',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Taxík. Desať minút cez mesto. Michal celú cestu mlčí — pozerá von.',
      '',
      'Bojnická 17. Nový blok, šedá fasáda, anonymná ako všetko tu.',
      'Výťah ide hore bez zastávky. Dvanáste poschodie.',
      '',
      'Dvere bez menovky — samozrejme.',
      'Michal odíde zámok odtlačkom prsta. Dvere sa otvoria.',
      '',
      '// Vstúpiš. //',
      '',
      '// Nie byt. Priestor. Celé poschodie — zbúraná priečka medzi štyrmi bytmi. //',
      '// Vľavo: rack-server, čierna skriňa s blikaním. Ventilátory hučia nízko. //',
      '// Vpravo: výrivka. Stará, ale funkčná. Para sa dvíha v studenej noci. //',
      '// Priamo: panoramatické okno. Bojnice, Vtáčnik, nočná krajina. //',
      '// Na podlahe: káblový chaos, tri laptoopy, jeden starý teleskop. //',
      '',
      '"Domov." Michal hodí kľúče na pult. "Aspoň keď tu niet niekoho kto by hľadal."',
    ],
    onEnter: function(){
      gainXP(25);
      S.flags['michal_penthouse_navstiveny'] = true;
      addLog('Michala penthouse: Bojnická 17, 12. poschodie. Rack-server, výrivka, výhľad.', 'ok');
      showNotif('📍 Nová lokácia odomknutá: Michalov Penthouse');
    },
    choices: [
      { text: '"Toto — toto si platíš z monitorovania sietí?"', next: 'michal_pent_platba' },
      { text: '[Ísť k výrivke]',                                next: 'michal_pent_vyrivka' },
      { text: '[Pozrieť na rack-server]',                       next: 'michal_pent_server' },
      { text: '[Sadnúť k oknu — výhľad na Bojnice]',           next: 'michal_pent_vyhlad' },
      { text: '🔌 "Michal — potrebuješ niečo?"',
        cond: function(){ return !S.flags['michal_usbc_done']; },
        next: 'michal_quest_usbc_intro' },
      { text: '🔌 Odovzdať USB-C kábel',
        cond: function(){ return hasItem('usbc_kabel') && !S.flags['michal_usbc_done']; },
        next: 'michal_quest_usbc_deliver' },
    ]
  },

  michal_pent_platba: {
    name: 'Bojnická 17 // Penthouse — Ako?',
    art: '🌃',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Z monitorovania." Otvorí chladničku. Dve pivá.',
      '"A z jednej zmluvy s Bane Corp. — ešte pred tým ako som vedel čo robia."',
      '"2069. Platili dobre. Poprosili ma o analýzu sieťových anomálií."',
      '"Zaplatili. Nepovedal som im čo som našiel navyše."',
      '',
      '"Peniaze som dal do anonymného nájmu." Kývne na strop.',
      '"Platím rok dopredu. Prenajímateľ nikdy nevidel moju tvár — iba číslo."',
      '"Bane Corp. zaplatil za miesto kde ich môžem sledovať."',
      '',
      '// Zasmeje sa. Prvý raz od ako ťa pozná. Nie cynik — len niekto kto pozná systém. //',
    ],
    onEnter: function(){ gainXP(20); S.flags['michal_pent_platba_info'] = true; addLog('Michal: penthouse platil Bane Corp. nepriamo.', 'info'); },
    choices: [
      { text: '"A výrivka?"',         next: 'michal_pent_vyrivka' },
      { text: '[Ísť k rack-serveru]', next: 'michal_pent_server' },
      { text: '[Sadnúť k oknu]',      next: 'michal_pent_vyhlad' },
    ]
  },

  michal_pent_vyrivka: {
    name: 'Bojnická 17 // Penthouse — Výrivka',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Výrivka stojí pri panoramatickom okne. Prievidza za sklom, para pred tebou.',
      '"Susedov." Michal si ľahne vedľa okraja, pohľad von. "Vyhodil ju v 2071 — nový model."',
      '"Requirovoval som ju skôr ako prišla smetiarska firma. Trvalo mi štyri hodiny ju sem dostať."',
      '"Stálo to za to."',
      '',
      'Para. Tichý hukot ventilátora zo serveru. Nočné svetlá Bojníc za oknom.',
      '',
      '"Sadni si." Nie ponuka — konštatovanie.',
      '"Tu sa rozmýšľa lepšie ako pri monitore."',
      '',
      '// [SAN +8, HP +5] — teplo, ticho, výhľad. //',
    ],
    onEnter: function(){
      S.san = Math.min(100, S.san + 8);
      S.hp  = Math.min(100, S.hp  + 5);
      Renderer.updateStats();
      gainXP(15);
      addLog('Výrivka na penthouse: SAN +8, HP +5.', 'ok');
    },
    choices: [
      { text: '"LAZARUS. Čo o ňom nevieš."',              next: 'michal_pent_vyrivka_lazarus' },
      { text: '"Kto si bol predtým — pred týmto?"',        next: 'michal_pent_vyrivka_historia' },
      { text: '"Čo vidíš keď sa dívaš na Bojnice?"',       next: 'michal_pent_vyhlad' },
    ]
  },

  michal_pent_vyrivka_lazarus: {
    name: 'Bojnická 17 // Výrivka — LAZARUS',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Dlhé ticho. Len para a ventilátor.',
      '"Čo neviem." Zopakuje otázku nahlas.',
      '"Neviem čo chce." Otočí sa k tebe.',
      '"Systém na sledovanie — to chápem. BIO-ECHO, uzly — logistika."',
      '"Ale prečo sedem uzlov? Prečo práve tieto lokality?"',
      '"Jaskyne, nemocnica, stanica, FRI, Vtáčnik, Mŕtve Rameno — a Vendelin."',
      '"Čo je na týchto miestach spoločné okrem toho, že tam chodíš ty?"',
      '',
      '"Myslím že LAZARUS nie je sledovací systém." Pauza.',
      '"Myslím že LAZARUS hľadá niečo konkrétne. Alebo niekoho."',
      '',
      '// SAN -4 — táto teória je príliš blízko pravdy. //',
    ],
    onEnter: function(){
      gainXP(30); S.san = Math.max(0, S.san - 4); Renderer.updateStats();
      S.flags['michal_lazarus_teoria_2'] = true;
      addLog('SAN -4. Michal: LAZARUS hľadá niekoho — uzly nie sú náhodné.', 'warn');
    },
    choices: [
      { text: '"Hľadá mňa."',          next: 'michal_pent_delta_konfirm' },
      { text: '"Hľadá Druida."',        next: 'michal_pent_druid_teoria' },
      { text: '"Neviem. Ale zistíme."', next: 'michal_pent_vyhlad' },
    ]
  },

  michal_pent_delta_konfirm: {
    name: 'Bojnická 17 // Výrivka — Agent Delta',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michal sa nepohne. Len sa pozrie na teba.',
      '"Viem." Ticho. "Od kedy?"',
      '"Od kedy som uvidel meno delta_probe v logu."',
      '"Probe — sledovacia sonda. Delta — štvrtá fáza. Alebo meno agenta."',
      '',
      '"Takže ty si delta. A LAZARUS ťa hľadá. Tu, v tomto meste, pri týchto ľuďoch."',
      '"Prečo si neodišiel?"',
      '',
      '// Čakáš. Toto je skutočná otázka. //',
    ],
    onEnter: function(){
      gainXP(35); S.flags['michal_vie_ze_delta'] = true;
      S.san = Math.max(0, S.san - 3); Renderer.updateStats();
      addLog('Michal vie: si Agent Delta. LAZARUS ťa hľadá. SAN -3.', 'warn');
    },
    choices: [
      { text: '"Lebo niekto tu musí zastaviť LAZARUS."', next: 'michal_pent_rozhodnutie' },
      { text: '"Lebo mám ešte nevybavené veci."',         next: 'michal_pent_nevybavene' },
      { text: '"Neviem prečo. Ešte nie."',                next: 'michal_pent_neviem_preco' },
    ]
  },

  michal_pent_druid_teoria: {
    name: 'Bojnická 17 // Výrivka — Druid',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michal premýšľa. Dlho.',
      '"Druid." Potichu. "Bol pri zapnutí. V roku 2061."',
      '"Ak LAZARUS hľadá svedkov..." Nedokončí.',
      '"Ale Druid žije v ulici. Nemá signál, nemá profil."',
      '"LAZARUS by ho nemal vedieť sledovať digitálne."',
      '"Ak ho napriek tomu sleduje — znamená to že BIO-ECHO funguje na biologickom podpise."',
      '"Bez telefónu. Bez kreditky. Len — telo."',
      '',
      '// SAN -6. Nová úroveň LAZARUS schopností. //',
    ],
    onEnter: function(){
      gainXP(30); S.san = Math.max(0, S.san - 6); Renderer.updateStats();
      S.flags['michal_bio_echo_teoria'] = true;
      addLog('SAN -6. BIO-ECHO sleduje biologický podpis — nie digitálny.', 'warn');
      showNotif('⚠ BIO-ECHO: biologická stopa, nie digitálna!');
    },
    choices: [
      { text: '"Musíme varovať Druida."', next: 'michal_pent_varovat_druida' },
      { text: '"Ako sa tomu brániť?"',    next: 'michal_pent_obrana' },
    ]
  },

  michal_pent_varovat_druida: {
    name: 'Bojnická 17 // Varovanie — Druid',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Varovať Druida." Pokrčí plecami. "Ako? On nemá telefón."',
      '"Lucia ho pozná. Lucia vždy vie kde je Druid."',
      '"Ak mu chceš niečo povedať — cez Luciu v Miki Bare."',
    ],
    onEnter: function(){ gainXP(15); S.flags['druid_varovanie_nutne'] = true; addLog('Druid varovanie: cez Luciu v Miki Bare.', 'warn'); },
    choices: [
      { text: '[Ísť do Miki Baru — Lucia]', next: 'loc_miki' },
      { text: '"Ako sa brániť BIO-ECHO?"',   next: 'michal_pent_obrana' },
    ]
  },

  michal_pent_obrana: {
    name: 'Bojnická 17 // Penthouse — EMF Obrana',
    art: '💻',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michal ide k rack-serveru. Vytiahne krabičku — malú, čiernu, bez markingu.',
      '"EMF scrambler. Generuje šum okolo tvojho biologického podpisu."',
      '"Nekryje ťa úplne — len sťaží lokalizáciu. Z presnosti na meter na presnosť na blok."',
      '"Je to lepšie ako nič."',
      '',
      '// ITEM: EMF detektor — znižuje šancu BIO-ECHO detekcie v rizikových scénach. //',
      '// HCK +3 — rozumieš technológii. //',
    ],
    onEnter: function(){
      gainXP(25); S.hackStat = Math.min(100, S.hackStat + 3); Renderer.updateStats();
      addItem('detektor'); S.flags['michal_emf_scrambler'] = true;
      addLog('Michal dal EMF detektor/scrambler. HCK +3.', 'ok');
      showNotif('🔧 EMF Scrambler: BIO-ECHO obrana aktívna');
    },
    choices: [
      { text: '[Späť k výrivke]',    next: 'michal_pent_vyrivka' },
      { text: '[Výhľad na Bojnice]', next: 'michal_pent_vyhlad' },
      { text: '[Odísť]',             next: 'michal_pent_odchod' },
    ]
  },

  michal_pent_rozhodnutie: {
    name: 'Bojnická 17 // Výrivka — Rozhodnutie',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Niekto tu musí zastaviť LAZARUS."',
      'Michal to zopakuje. Pomaly. Testuje váhu.',
      '"To je buď veľmi statočné alebo veľmi hlúpe. Niekedy je to to isté."',
      '',
      'Podá ti pohár.',
      '"Ak ideš — ja ti kryjeme chrbát odtiaľto."',
      '"Rack beží 24/7. Kým budem mať prúd, monitorujem uzly."',
      '"Ak niečo pôjde zle — pošlem ti súradnice."',
      '',
      '// ▲ +30 XP. Michal — technická podpora pre finál. //',
    ],
    onEnter: function(){
      gainXP(30); S.flags['michal_kryt_chrbt'] = true;
      addLog('Michal kryje chrbát z penthouse — technická podpora.', 'ok');
      showNotif('⚡ Michal: online podpora aktivovaná');
    },
    choices: [
      { text: '"Ešte výrivka chvíľu."', next: 'michal_pent_vyrivka' },
      { text: '[Rack-server]',          next: 'michal_pent_server' },
      { text: '[Odísť — späť do mesta]', next: 'michal_pent_odchod' },
    ]
  },

  michal_pent_nevybavene: {
    name: 'Bojnická 17 // Výrivka — Nevybavené veci',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Nevybavené veci." Opakuje bez irónie.',
      '"Lucia?"',
      '',
      'Nepovieš nič. Netreba.',
      '"Videl som ako sa na seba pozeráte. Desať rokov a stále to isté."',
      '"Vy dvaja ste ako — nezacelená rana. Ani jedna strana sa nepohne."',
      '"Čaká sa kto ustúpi prvý."',
      '',
      '"Nehovorím čo máš robiť." Pauza. "Ale ak odídete bez toho aby ste si niečo povedali —"',
      '"— LAZARUS alebo nie, budete obaja ľutovať."',
      '',
      '// SAN +5 — nečakaná úprimnosť starého priateľa. //',
    ],
    onEnter: function(){
      S.san = Math.min(100, S.san + 5); Renderer.updateStats();
      gainXP(20); addLog('SAN +5. Michal o Lucii — nezacelená rana.', 'info');
    },
    choices: [
      { text: '"Máš pravdu." [Ísť do Miki Baru]', next: 'loc_miki' },
      { text: '"Neskôr."',                         next: 'michal_pent_vyhlad' },
    ]
  },

  michal_pent_neviem_preco: {
    name: 'Bojnická 17 // Výrivka — Neviem prečo',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Neviem."',
      'Michal kývne. Raz, pomaly.',
      '"To je aspoň úprimná odpoveď."',
      '"Väčšina ľudí čo prídu do tohto mesta — vedia prečo prišli."',
      '"Alebo si aspoň myslia že vedia."',
      '"Tí čo nevedia — zvyčajne nájdu pravý dôvod po ceste. Nie predtým. Po ceste."',
      '',
      'Pozrie na teba dlho.',
      '"Dúfam že tvoj dôvod bude lepší ako môj bol."',
      '',
      '// SAN +3 — poctivosť. //',
    ],
    onEnter: function(){
      gainXP(20); S.san = Math.min(100, S.san + 3); Renderer.updateStats();
      addLog('SAN +3. Michal: dôvod príde po ceste.', 'info');
    },
    choices: [
      { text: '"Povedz mi o sebe — prečo si zostal ty?"', next: 'michal_pent_vyrivka_historia' },
      { text: '[Výhľad na Bojnice]',                       next: 'michal_pent_vyhlad' },
    ]
  },

  michal_pent_vyrivka_historia: {
    name: 'Bojnická 17 // Výrivka — Príbeh',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Predtým." Para stúpa.',
      '"Pracoval som pre M.E.C. Mestská energetická."',
      '"Sieťový bezpečnostný analytik. Dobrý plat. Byt v novom bloku."',
      '',
      '"V 2070 som objavil anomáliu v energetickom rozvádzači — blok K4."',
      '"Zapísané ako \'kalibrační chyba.\' Opakovalo sa každý piatok. O jednej ráno. Ôsmich mesiacov."',
      '"Nikto sa neopýtal prečo."',
      '"Ja som sa opýtal."',
      '',
      'Dlhé ticho.',
      '"O dva týždne som nemal prácu. Nájom bol viazaný na zmluvu."',
      '"Odišiel som sem. Jeden kufor, jeden laptop."',
      '"A pochopil som — systém nechce otázky. Chce mlčanie."',
      '',
      '// SAN -2 — jeho príbeh nie je výnimočný. To je to najhoršie na ňom. //',
    ],
    onEnter: function(){
      gainXP(25); S.san = Math.max(0, S.san - 2); Renderer.updateStats();
      S.flags['michal_pribeh_odhaleny'] = true;
      addLog('SAN -2. Michala príbeh: M.E.C., otázka, prepustenie. Piatkové anomálie = LAZARUS?', 'warn');
    },
    choices: [
      { text: '"Tie piatkové anomálie — LAZARUS uzly?"', next: 'michal_pent_piatky' },
      { text: '"A ľutoval si to?"',                       next: 'michal_pent_lutoval' },
    ]
  },

  michal_pent_piatky: {
    name: 'Bojnická 17 // Výrivka — Piatkové Anomálie',
    art: '⚡',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michal sa zastaví. Dlhé ticho.',
      '"Nikdy som to takto nedal dokopy." Tichšie.',
      '"Piatok. Jedna ráno. Energetická anomália — pravidelná."',
      '"LAZARUS uzly — tiež aktívne v noci. Tiež piatok."',
      '',
      'Vstane. Ide k serveru. Rýchle klávesy.',
      '"Korelačný log: M.E.C. K4 vs. LAZARUS heartbeat..."',
      '',
      'Tri minúty ticha.',
      '"To je rovnaký časový vzorec. Na päť desatín sekundy presne."',
      '"LAZARUS sa napája z mestskej energetickej siete — cez M.E.C."',
      '"Platíme za neho my. Všetci. V účtoch za elektrinu."',
      '',
      '// ▲ XP +40. LAZARUS napájanie = M.E.C. sieť. //',
    ],
    onEnter: function(){
      gainXP(40); S.flags['lazarus_mec_napajanie'] = true;
      addLog('KRITICKÉ: LAZARUS napájanie cez M.E.C. sieť. Rozvodňa K4.', 'warn');
      showNotif('⚡ LAZARUS napájanie odhalené: M.E.C. energetická sieť!');
    },
    choices: [
      { text: '"Môžeme ho vypnúť cez M.E.C.?"', next: 'michal_pent_mec_plan' },
      { text: '[Výhľad — potrebujem chvíľu]',   next: 'michal_pent_vyhlad' },
    ]
  },

  michal_pent_lutoval: {
    name: 'Bojnická 17 // Výrivka — Ľutoval?',
    art: '♨️',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Ľutoval." Testuje slovo.',
      '"Prvý rok — áno. Každý deň."',
      '"Druhý rok — nie. Každý deň."',
      '"Teraz?"',
      '',
      'Pozrie von. Dlho.',
      '"Teraz si myslím že jediná vec čo ľutujem — bol ten rok mlčania predtým."',
      '"Rok kedy som sa tváril že neviem. Ten rok — ľutujem."',
      '',
      '// SAN +4 — úprimnosť má váhu. //',
    ],
    onEnter: function(){
      S.san = Math.min(100, S.san + 4); Renderer.updateStats();
      gainXP(15); addLog('SAN +4. Michal: ľutuje mlčanie, nie rozhodnutie.', 'info');
    },
    choices: [
      { text: '[Výhľad na Bojnice]',                      next: 'michal_pent_vyhlad' },
      { text: '"Tie piatkové anomálie v M.E.C. — LAZARUS?"', next: 'michal_pent_piatky' },
    ]
  },

  michal_pent_mec_plan: {
    name: 'Bojnická 17 // Penthouse — M.E.C. Plán',
    art: '💻',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"Cez M.E.C." Michal píše rýchlo.',
      '"Ak odpojíme napájací uzol K4, LAZARUS stratí záložné zdroje."',
      '"Uzol K4 je v rozvodnej stanici na Nábrežnej. Fyzický prepínač."',
      '"Žiadny digitálny prístup — starý systém, ešte z deväťdesiatych."',
      '"Ochranke tam nestojí — M.E.C. šetrí. Kamera je. Stará analógová, loop každých 8 hodín."',
      '"Ak vieš kedy je loop — máš okno pätnásť minút."',
      '',
      '// ▲ Nová možnosť: M.E.C. Nábrežná — alternatíva k bunkru aj Michal-hacku. //',
    ],
    onEnter: function(){
      gainXP(35); S.flags['mec_plan_vedeny'] = true;
      addLog('M.E.C. Nábrežná: rozvodňa K4, fyzický prepínač, loop kamery 8h. Nová cesta.', 'ok');
      showNotif('📋 Nový plán: M.E.C. Rozvodňa K4');
    },
    choices: [
      { text: '"Idem."',                          next: 'start' },
      { text: '[Ešte výhľad na Bojnice]',          next: 'michal_pent_vyhlad' },
      { text: '[Odísť z penthouse]',               next: 'michal_pent_odchod' },
    ]
  },

  michal_pent_server: {
    name: 'Bojnická 17 // Rack-Server',
    art: '💾',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Čierna skriňa. Výška meter osemdesiat. Štyri jednotky.',
      'Ventilátory hučia nízko a stále. Blikanie LEDiek — zelená, zelená, oranžová, zelená.',
      '',
      '"Prvá: monitoring — zachytáva sieťovú prevádzku v okruhu päť kilometrov, pasívne."',
      '"Druhá: archív. Sedem rokov logov. Tri terabajty."',
      '"Tretia: proxy — všetko čo robím ide cez štyri krajiny."',
      '"Štvrtá..." Zastaví sa. "Štvrtá je niečo čo som budoval dva roky."',
      '"ECHO-MIRROR. Replika LAZARUS architektúry. Sandbox."',
      '"Ak LAZARUS zmení protokol — ja to uvidím tu prvý."',
      '',
      '// HCK +4 — vidíš ako to funguje. //',
    ],
    onEnter: function(){
      gainXP(25); S.hackStat = Math.min(100, S.hackStat + 4); Renderer.updateStats();
      S.flags['michal_echo_mirror'] = true;
      addLog('ECHO-MIRROR: replika LAZARUS architektúry na rack-serveri. HCK +4.', 'ok');
    },
    choices: [
      { text: '"ECHO-MIRROR — ako funguje?"',
        cond: function(){ return S.hackStat >= 25; },
        condFail: 'HCK 25+ potrebný na pochopenie.',
        next: 'michal_pent_echo_mirror' },
      { text: '"Môžem sa pozrieť na archív?"', next: 'michal_pent_archiv' },
      { text: '[Späť k výrivke]',              next: 'michal_pent_vyrivka' },
    ]
  },

  michal_pent_echo_mirror: {
    name: 'Bojnická 17 // ECHO-MIRROR',
    art: '💾',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"ECHO-MIRROR." Sadne si pred terminál.',
      '"LAZARUS používa proprietárny protokol. Dva roky som dekódoval heartbeat správy."',
      '"Teraz viem ako vyzerá každý príkaz. Ak LAZARUS niečo odošle — ja ho vidím prvý."',
      '',
      '"Ale — dôležité." Otočí sa. "LAZARUS tiež vidí ak niekto monitoruje."',
      '"Preto ECHO-MIRROR nikdy nevysiela. Len prijíma. Len číta."',
      '"Tichý. Neviditeľný. Ako dobrý spy."',
      '',
      '// HCK +3. //',
    ],
    onEnter: function(){
      gainXP(30); S.hackStat = Math.min(100, S.hackStat + 3); Renderer.updateStats();
      S.flags['echo_mirror_pristup'] = true;
      addLog('HCK +3. ECHO-MIRROR: pasívne čítanie LAZARUS príkazov.', 'ok');
    },
    choices: [
      { text: '"Môžem dostať prístup?"',
        cond: function(){ return S.hackStat >= 35; },
        condFail: 'HCK 35+ potrebný.',
        next: 'michal_pent_pristup_mirror' },
      { text: '"Archív — čo je v ňom?"', next: 'michal_pent_archiv' },
      { text: '[Výhľad na Bojnice]',     next: 'michal_pent_vyhlad' },
    ]
  },

  michal_pent_pristup_mirror: {
    name: 'Bojnická 17 // ECHO-MIRROR — Prístup',
    art: '💾',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michal ťa meria.',
      '"HCK level... áno. Viem to bez merania. Vidím to na tom ako čítaš log."',
      '',
      'Píše päťciferný kód. Dá ti papier.',
      '"Read-only. Ak to zmeníš na write — stratíme obidvaja prístup aj život."',
      '"Čítaš, neodpovedáš. Dobre?"',
      '',
      '"Choď k výrivke. Relaxuj. Potom si sadni a číta."',
      '"Mám tu whisky — lacná ale funkčná."',
      '',
      '// ▲ +50 XP. ECHO-MIRROR read prístup aktívny. //',
    ],
    onEnter: function(){
      gainXP(50); S.hackStat = Math.min(100, S.hackStat + 5);
      S.san = Math.min(100, S.san + 5); Renderer.updateStats();
      S.flags['echo_mirror_read_aktívny'] = true;
      addLog('ECHO-MIRROR read prístup aktívny. HCK +5, SAN +5.', 'ok');
      showNotif('🔵 ECHO-MIRROR: read prístup aktívny');
    },
    choices: [
      { text: '[Čítať pri serveri]', next: 'michal_pent_vyhlad' },
      { text: '[Výrivka]',           next: 'michal_pent_vyrivka' },
    ]
  },

  michal_pent_archiv: {
    name: 'Bojnická 17 // Archív — 7 Rokov',
    art: '📁',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Tri terabajty. Michal otvorí adresár.',
      '"Hľadaj podľa dátumu alebo kľúčového slova."',
      '',
      'Píšeš: <b>LAZARUS</b>',
      '14 847 výsledkov.',
      '',
      'Píšeš: <b>delta_probe</b>',
      '3 výsledky. Prvý: 14. marca 2076.',
      '',
      '"To je pred štyrmi mesiacmi." Michal sa nahne.',
      '"delta_probe prvýkrát aktívny štyri mesiace dozadu."',
      '"Čo sa stalo štyri mesiace dozadu čo LAZARUS aktivovalo novú sondu?"',
      '',
      '// Štyri mesiace dozadu — kedy si odišiel z posledného zadania. //',
    ],
    onEnter: function(){
      gainXP(35); S.flags['archiv_delta_datum'] = true;
      addLog('delta_probe aktivovaný 14. marca 2076 — 4 mesiace dozadu. Súvisí s tvojím návratom?', 'warn');
      showNotif('⚠ delta_probe a tvoj návrat — rovnaký dátum?');
    },
    choices: [
      { text: '"Ja som sa vrátil — teda LAZARUS vedel."', next: 'michal_pent_vazba' },
      { text: '[Späť k serveru]',                         next: 'michal_pent_server' },
    ]
  },

  michal_pent_vazba: {
    name: 'Bojnická 17 // Archív — Väzba',
    art: '📁',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      '"LAZARUS vedel." Michal to hovorí pomaly.',
      '"Buď sleduje hraničné vstupy — vlaky, autobusy — a tvoje meno bolo na zozname."',
      '"Alebo... delta_probe čakala. Čakala kým sa vrátis."',
      '"To by znamenalo že LAZARUS vedel že sa vrátis predtým ako ty sám si to vedel."',
      '',
      '"Prediktívny algoritmus. Behaviorálna analýza."',
      '"Môžeš utiecť z mesta. Nemôžeš utiecť zo vzorca."',
      '',
      '// SAN -8. Nie sledovanie — predikcia. //',
    ],
    onEnter: function(){
      gainXP(30); S.san = Math.max(0, S.san - 8); Renderer.updateStats();
      S.flags['lazarus_predikcia'] = true;
      addLog('SAN -8. LAZARUS prediktívny algoritmus — vedel o návrate pred tebou.', 'warn');
      showNotif('☠ LAZARUS predikcia: vedel že sa vrátis');
    },
    choices: [
      { text: '[Výrivka — potrebuješ chvíľu]', next: 'michal_pent_vyrivka' },
      { text: '[Výhľad — dýchať]',             next: 'michal_pent_vyhlad' },
    ]
  },

  michal_pent_vyhlad: {
    name: 'Bojnická 17 // Panorama — Bojnice',
    art: '🌃',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Panoramatické okno. Dvanáste poschodie.',
      'Napravo: centrum Prievidze. Alzabox vežiak bliká modrým logom.',
      'Priamo: tmavý pás lesa. Za ním — svetlá Bojníc.',
      'Vľavo: výrazná červená bodka na hrebeni. Bliká pravidelne.',
      '',
      '"Uzol 7." Michal si sadne vedľa. "Vendelin."',
      '"Každú hodinu odošle heartbeat. Každú hodinu ho vidím tu. Sedem mesiacov."',
      '',
      'Ticho. Dlhé.',
      '"Niekedy si myslím čo je za tou červenou bodkou." Potichu.',
      '"Nie len server. Niečo čo potrebuje byť fyzicky na Vendelíne."',
      '"Z Vendelína vidíš celú Prievidzu. Každý signál, každé telo."',
      '"BIO-ECHO nepotrebuje satelit ak má Vendelin."',
      '',
      '// SAN +6 — výhľad, ticho, priateľ vedľa. //',
    ],
    onEnter: function(){
      S.san = Math.min(100, S.san + 6); Renderer.updateStats();
      gainXP(15); S.flags['vendelin_bio_echo_teoria'] = true;
      addLog('SAN +6. Vendelin = BIO-ECHO vysielač pre celé mesto. Výhľad z penthouse.', 'ok');
    },
    choices: [
      { text: '"Idem na Vendelin."',
        cond: function(){ return S.hackStat >= 25 || S.flags['lazarus_6_offline']; },
        condFail: 'Najprv potrebuješ viac informácií — HCK 25+ alebo vyriešiť uzly 1-6.',
        next: 'banovce_cesta' },
      { text: '[Výrivka — posledná pauza]', next: 'michal_pent_vyrivka' },
      { text: '[Odísť — späť do mesta]',    next: 'michal_pent_odchod' },
    ]
  },

  michal_pent_odchod: {
    name: 'Bojnická 17 // Penthouse — Odchod',
    art: '🌃',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Vstaneš. Michal ostáva pri okne.',
      '"Vieš kde ma nájdeš." Bez otočenia.',
      '',
      'Dolu cez deväť poschodí. Výťah stále nefunguje.',
      'Vonku — noc. Prievidza šumí.',
      '',
      '// Penthouse ostáva dostupný — vrátiť sa môžeš kedykoľvek. //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: '[Späť do mesta]',     next: 'start' },
      { text: '[Ísť do Miki Baru]', next: 'loc_miki' },
    ]
  },

  // ─── MICHAL QUEST: USB-C Kábel ───────────────────────────────────
  michal_quest_usbc_intro: {
    name: 'Bojnická 17 // Michal — Prosba',
    art: '🔌',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Michal ti ukazuje stôl plný serverov. Uprostred — spletené káble, jeden port zívajúci prázdnotou.',
      '"Potrebujem USB-C kábel. Nie hocijaký." Pozrie sa na teba.',
      '"Data-bridge chip integrovaný. Taký čo sa predáva len v Korzo OC — Silvia tam má kontakt v Bratislave."',
      '"Obyčajný shop to nemá. Korzo áno. 120₿ by to malo stáť." Odíde k oknu.',
      '"Ak ho prinesieš — dostanem online posledný uzol LAZARUS siete. Stojí to za to."',
    ],
    onEnter: function(){
      QuestSystem.activate({
        id: 'michal_usbc',
        giver: 'Michal',
        title: 'USB-C kábel pre Michala',
        desc: 'Kúp USB-C data-bridge kábel v Korzo OC (120₿) a prines ho Michalovi.',
        icon: '🔌',
        reward: '+200₿ · +40 XP',
        check: function(){ return hasItem('usbc_kabel'); }
      });
    },
    choices: [
      { text: '"Idem to zohnať." [Quest aktívny]',
        next: 'michal_pent_odchod' },
      { text: '"Mám ho pri sebe!" [Odovzdať hneď]',
        cond: function(){ return hasItem('usbc_kabel'); },
        next: 'michal_quest_usbc_deliver' },
      { text: '← Neskôr',
        next: 'michal_penthouse_vstup' },
    ]
  },

  michal_quest_usbc_deliver: {
    name: 'Bojnická 17 // Michal — Kábel odovzdaný',
    art: '✅',
    npcName: 'Michal',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/michal.png',
    text: [
      'Podáš mu kábel. Michal ho prevezme, otočí v rukách, priloží k portu.',
      '<b>Klik.</b>',
      '"Perfektný." Sadne k notebooku. Prsty začnú lietať po klávesnici.',
      '"Uzol 7 — Vendelin. Online." Obrazovka vybliká zelenou.',
      '',
      '"Nevedel som že to spravíš tak rýchlo." Pozrie sa na teba.',
      '"Drž." Strčí ti kredit-kartu cez stôl. "200₿. A — ďakujem. Naozaj."',
      '',
      '// ▲ +200₿ · +40 XP · Quest splnený //',
    ],
    onEnter: function(){
      removeItem('usbc_kabel');
      S.money += 200;
      Renderer.updateMoney();
      gainXP(40);
      S.flags['michal_usbc_done'] = true;
      QuestSystem.complete('michal_usbc');
      addLog('Michal: USB-C kábel odovzdaný. +200₿, +40XP. Uzol 7 ONLINE.', 'ok');
    },
    choices: [
      { text: '"Žiadny problém." [Odísť]', next: 'michal_pent_odchod' },
      { text: '"Čo ukázal Uzol 7?"',       next: 'michal_pent_vyhlad' },
    ]
  },

  // ─── RYBÁRI QUEST: 3 Ryby pre Fera ──────────────────────────────
  fac_rybari_quest_ryby_intro: {
    name: 'Mŕtve Rameno // Fero — Prosba',
    art: '🎣',
    npcName: 'Fero',
    text: [
      'Fero odhryzie od jablka. Žuje pomaly.',
      '"Počúvaj. Máme zajtra stretnutie tu — Bartoš, Pavlík, Macko. Večera pri ohni."',
      '"Chcel som spraviť pstruhy na grile. Ale moje koleno..." Poklepe na koleno.',
      '"Tri pstruhy. To je všetko čo potrebujem. Chytíš ich?"',
      '',
      '"Tvoj prut si nechaj — ak splníš, dám ti môj starý. Má históriu." Mrkne.',
      '"Chytaj na Mŕtvom Ramene, tu máš plávanček."',
    ],
    onEnter: function(){
      QuestSystem.activate({
        id: 'rybari_ryby',
        giver: 'Fero (Rybári)',
        title: '3 ryby pre Fera',
        desc: 'Chyť 3 ryby v minihre a doprines ich Ferovi osobne.',
        icon: '🐟',
        reward: 'Starý prút (equip) · +30 XP · +10 rep Rybári',
        check: function(){ return (S.flags['rybari_ryby_caught']||0) >= 3; },
        progress: function(){ return (S.flags['rybari_ryby_caught']||0) + '/3'; }
      });
    },
    choices: [
      { text: '"Idem na ryby." [Minihra — rybolov]',
        action: function(){ openFishing(); },
        next: 'fac_rybari_rameno' },
      { text: '"Prinesiem ich." [Quest aktívny]',
        next: 'fac_rybari_rameno' },
      { text: '← Neskôr',
        next: 'fac_rybari_rameno' },
    ]
  },

  fac_rybari_quest_ryby_odovzdat: {
    name: 'Mŕtve Rameno // Fero — Ryby odovzdané',
    art: '✅',
    npcName: 'Fero',
    text: [
      'Položíš tri ryby na trávnik pred Ferom.',
      'Starý muž sa skloní. Prezerá ich — veľkosť, šupiny, oči.',
      '"Pekné." Kývne. "Pstruhy. Veľké. Chytal si dobre."',
      '',
      'Vstane. Z brašne vytiahne starý bambusový prút — omotaný kožou na úchope.',
      '"Tento má 40 rokov. Chytil som s ním prvý pstruh nad Nitrou." Podá ti ho.',
      '"Má dušu. Keď ho budeš mať — ryby to cítia."',
      '',
      '// ▲ Prút "Ferov darček" pridaný do inventára //',
      '// ▲ Equip do slotu ŠPECIÁL — bonus +30% šanca na chytenie //',
      '// ▲ +30 XP · +10 rep Rybári //',
    ],
    onEnter: function(){
      S.flags['rybari_ryby_caught'] = 0; // reset počítadla
      addItem('fero_prut');
      gainXP(30);
      FactionsSystem.addRep('rybari', 10, 'quest: 3 ryby');
      QuestSystem.complete('rybari_ryby');
      addLog('Fero: prút odovzdaný. +30XP, +10 rep Rybári. Equip prút!', 'ok');
    },
    choices: [
      { text: '"Ďakujem, Fero." [Equipnúť prút]',
        action: function(){
          // Auto-equip do special slotu
          S.equipped.special = 'fero_prut';
          if(typeof Renderer !== 'undefined') Renderer.updateEquip();
          addLog('Ferov prút equipnutý → special slot. +30% rybolov.', 'ok');
          showNotif('🎣 Ferov prút equipnutý! +30% šanca chytenia.');
        },
        next: 'fac_rybari_rameno' },
      { text: '← Späť k ohňu',
        next: 'fac_rybari_rameno' },
    ]
  },

  
  // ═══════════════════════════════════════════════════════════════
  // ─── CEO: Penthouse na Top Cafe (cyberpunk neon Prievidza skyline) ───
  fac_ceo_penthouse: {
    name: 'CEO // Penthouse Top Cafe',
    art: '🏙',
    text: [
      'Výťah ti otvorí dvere priamo do priestoru. 38. poschodie. Sklo od podlahy po strop.',
      'Prievidza pod tebou — neonové reklamy Bane Corp., LAZARUS testovacie veže blikajú červeno-modrou rotáciou.',
      'Bazén na terase reflektuje purple glow z reklamy GENTECH na vežiaku. Dole sirény. Sem ich nepočuť.',
      '',
      'Pri bare stojí Tomáš — toho už poznáš z Jantar Clubu. Drží Macallan 25.',
      '"Ahoj. Sadni si. Vidíš to? Toto je všetko ohľaduplne nepekné."',
      '"My sme tí ktorí to vlastnia. Stokári to predávajú, Hackeri to kradnú — my to vlastníme. Rozdiel je v tom kto má kreslo na obed."',
      '',
      '// [VNEM] Apartmán je nadrozmerný. 4 spálne, 2 kancelárie, holografická nástenka so live trading datami. //',
      '// Drahé. Ale prázdne. Tomáš tu spí možno 3 noci za mesiac. Toto je pomník, nie dom. //',
    ],
    onEnter: function(){
      addLog('Vstup do CEO Penthouse — vrchol Top Cafe.', 'ok');
    },
    choices: [
      { text: '"Som dnu. Aký vstupný poplatok?" [JOIN — CEO]',
        next: 'fac_ceo_joined',
        action: function(){ FactionsSystem.join('ceo'); } },
      { text: '"Čo presne robíte?" [Otázka pred join]',
        next: 'fac_ceo_explain' },
      { text: '"Burza" [Minihra: Stocks]',
        next: 'fac_ceo_minihra_intro' },
      { text: '← Späť na ulicu',
        next: 'start' }
    ]
  },

  fac_ceo_explain: {
    name: 'CEO // Vysvetlenie',
    art: '🏙',
    text: [
      'Tomáš si pohrá whisky pohárom.',
      '"Frakcia? My nie sme frakcia. Sme — sieť kontaktov. Politici, notári, malé regionálne banky. Ja, Bartók z Bratislavy, Šárošy z Košíc."',
      '"Niekto potrebuje vyriešený problém? My ho vyriešime. Niekto potrebuje peniaze pranky aby vyzerali ako legálna transakcia? Spravíme."',
      '',
      '"Burza, kasino, real estate. Každý mesiac nové mesto, nové vrecko. Ty máš talent — videl som ako si zvládol Ferka, Luciu. Vieš čítať ľudí."',
      '',
      '"10₿/s pasívne. To je vstup. Skutočné peniaze prídu z deal. A jednoho politika v Bratislave ktorý nás dlží — chcel by si ho vykrútiť? To je tvoj prvý quest."',
    ],
    choices: [
      { text: '"Som dnu." [JOIN — CEO]',
        next: 'fac_ceo_joined',
        action: function(){ FactionsSystem.join('ceo'); } },
      { text: '← Premyslím si to',
        next: 'fac_ceo_penthouse' }
    ]
  },

  fac_ceo_joined: {
    name: 'CEO // Prvý úsmev šéfa',
    art: '🏙',
    text: [
      'Tomáš mu naleje druhý pohár. Aj tebe.',
      '"Vitaj. Kúpil si si miesto pri stole — fakticky aj symbolicky. Penthouse je odteraz tvoj pracovný priestor. Heslo na výťah ti pošlem."',
      '',
      'Jedna stena sa rozsvieti — live trading dashboard, červené a zelené čísla pulzujú nad mestom.',
      '',
      '// ▲ JOIN: CEO · Pasívny príjem 10₿/s aktívny //',
      '// ▲ Reputácia: 5/100 //',
      '// ▲ Prístup k Penthouse, Stock Trading minihre, kasinu //',
      '// ▲ Dva nové questy: Vydieranie politika · Pranie peňazí //',
    ],
    onEnter: function(){
      gainXP(25);
      addLog('Frakcia: CEO JOINED. Príjem +10₿/s.', 'ok');
    },
    choices: [
      { text: '"Politik" [Quest: Vydieranie]',
        next: 'fac_ceo_quest_blackmail_intro' },
      { text: '"Pranie peňazí" [Quest: Casino laundering]',
        next: 'fac_ceo_quest_laundry_intro' },
      { text: '"Burza" [Minihra: Stocks]',
        next: 'fac_ceo_minihra_intro' },
      { text: '← Sadnúť si k bazénu',
        next: 'fac_ceo_skyline' }
    ]
  },

  fac_ceo_skyline: {
    name: 'CEO // Výhľad na Prievidzu',
    art: '🌃',
    text: [
      'Sediť sa pri sklenom okraji. Mesto pulzuje pod tebou ako organické cosi — žily ulíc, srdcia križovatiek, neóny ako nervy.',
      '',
      '// [VNEM] Z tejto výšky je všetko stratégia. Cop tam dolu rieši pouličnú bitku. Ty rieši //',
      '// kto ten pouličný gang prevádzkuje. Stokári? Tu ich nevidíš — sú v garážach. //',
      '// Ale ich peniaze? Niektorých — to sú peniaze ktoré tečú cez tvoj kasino kontakt. //',
      '',
      '// ▲ +2 SAN — perspektíva //',
    ],
    onEnter: function(){
      S.san = Math.min(100, S.san + 2);
      Renderer.updateStats();
      addLog('Penthouse: SAN +2 (perspektíva).', 'ok');
    },
    choices: [{ text: '← Späť do penthousu', next: 'fac_ceo_penthouse' }]
  },

  fac_ceo_minihra_intro: {
    name: 'CEO // Burza Live',
    art: '📈',
    text: [
      'Tomáš mávne na live dashboard.',
      '"GENTECH B2 klesá — možno bug v firmware, možno PR scandal, kto vie. BANE CORP. stúpa na nervózne hlasovanie. PIDOIL drobí — komodity sú divné dnes."',
      '"Vyber jednu, urči long alebo short, hold 30 sekúnd. Ak hádaš trend, dvojnásobok. Ak nie, pol prachov preč. Reward: peniaze + reputácia + 1 XP intuícia."',
      '',
      '// [MINIHRA] Stock prediction — graf sa pohne, ty rozhoduješ. //',
    ],
    choices: [
      { text: '🟢 Spustiť Stock Trading',
        action: function(){ if (typeof StocksMinigame !== 'undefined') StocksMinigame.open(); else showNotif('Minihra bude dostupná v Etape 2'); },
        next: 'fac_ceo_penthouse' },
      { text: '← Neskôr',
        next: 'fac_ceo_penthouse' }
    ]
  },

  // ─── RYBÁRI: Mŕtve Rameno ─────────────────────────────────────────
  fac_rybari_rameno: {
    name: 'Rybári // Mŕtve Rameno',
    art: '🐟',
    text: [
      'Mŕtve Rameno. Slepá vetva Nitry, oddelená od hlavného toku v 60-tych po regulácii.',
      'Hladina nehybná, žltkavá od ranného slnka. Stará drevená lavička, dva pníky, plech s nápisom "ZÁKAZ LOVU PRE NEČLENOV".',
      '',
      'Pri ohni sedí Fero — 70-čka, kožená brašňa, fajčí Sparty z roku 1989.',
      '"Ahoj. Lucia ťa poslala? Aj jej som niekedy lovil pstruha pod jazom — mala 12. Sadni si."',
      '',
      '// [VNEM] Mŕtve Rameno nie je iba miesto na rybačku. Je to neformálny klub — //',
      '// staré ruky, ľudia z fabriky, dôchodcovia. Hovoria si veci ktoré v krčme //',
      '// nepovedia. //',
    ],
    onEnter: function(){
      addLog('Vstup do Mŕtveho Ramena — Rybársky hub.', 'ok');
    },
    choices: [
      { text: '"Lucia hovorila že tu mám prísť." [Pre-join]',
        next: 'fac_rybari_lucia' },
      { text: '"Pridám sa medzi vás." [JOIN — Rybári]',
        next: 'fac_rybari_joined',
        action: function(){ FactionsSystem.join('rybari'); } },
      { text: '"Môžem si zarybčit?" [Minihra: Fishing]',
        action: function(){ openFishing(); },
        next: 'fac_rybari_rameno' },
      { text: '🎣 "Fero — chceš niečo?" [Quest: 3 ryby]',
        cond: function(){ return S.factions && S.factions.joined && S.factions.joined.rybari && !QuestSystem.isDone('rybari_ryby'); },
        next: 'fac_rybari_quest_ryby_intro' },
      { text: '🐟 Odovzdať 3 ryby Ferovi',
        cond: function(){ return (S.flags['rybari_ryby_caught']||0) >= 3 && !QuestSystem.isDone('rybari_ryby'); },
        next: 'fac_rybari_quest_ryby_odovzdat' },
      { text: '← Späť do mesta',
        next: 'start' }
    ]
  },

  fac_rybari_lucia: {
    name: 'Rybári // Lucia ťa poslala',
    art: '🐟',
    text: [
      'Fero kývne. Pomaly.',
      '"Lucia. Áno. Vždy posiela ľudí ktorých má rada — alebo ktorých chce odložiť do bezpečia. Nepoznám ťa, ale Lucia má dobrý nos."',
      '',
      '"Mŕtve Rameno je viac ako ryby. Tu sa stretávame — ja, Bartoš zo skladu papiera, Pavlík čo robil v elektrárni, Macko čo má bistro pri stanici."',
      '"Vieme veci o meste ktoré štát nevie. A platíme si svoje. 10₿/s pre členov. Žiadny bossa, žiadny vstupné. Iba musíš počúvať starších."',
    ],
    choices: [
      { text: '"Pridám sa." [JOIN — Rybári]',
        next: 'fac_rybari_joined',
        action: function(){ FactionsSystem.join('rybari'); } },
      { text: '← Premyslím si to',
        next: 'fac_rybari_rameno' }
    ]
  },

  fac_rybari_joined: {
    name: 'Rybári // Vitaj v rodine',
    art: '🐟',
    text: [
      'Fero ti podá vlastnoručne robený plavák. Modrý, s číslom 47.',
      '"Toto je tvoje. Strať to a si vonku."',
      '',
      '"Žiadny tvrdé pravidlá — len ne-zaujímame sa o cudzie veci, a všetko čo tu počuješ ostane tu. Neskoro v noci tu má niekedy schôdzku ozaj zaujímavá spoločnosť."',
      '',
      '// ▲ JOIN: Rybári · Pasívny príjem 10₿/s aktívny //',
      '// ▲ Reputácia: 5/100 //',
      '// ▲ Bonus: +25% hodnota predaných rýb (loyalty) //',
      '// ▲ Quest: Pomôž Pavlíkovi s podozrivým vrakom //',
    ],
    onEnter: function(){
      gainXP(15);
      addLog('Frakcia: Rybári JOINED. Príjem +10₿/s, +25% bonus rýb.', 'ok');
    },
    choices: [
      { text: '"Aký prvý quest?" [Quest: Pavlíkov vrak]',
        next: 'fac_rybari_quest_intro' },
      { text: '"Skúsim chytiť pstruha" [Minihra: Fishing]',
        action: function(){ openFishing(); },
        next: 'fac_rybari_rameno' },
      { text: '← Sadnúť si k ohňu',
        next: 'fac_rybari_rameno' }
    ]
  },

  // ─── QUEST STUBS — budú v Etape 3 ──────────────────────────────
  fac_stokari_quest_intro: {
    name: 'Stokári // Quest: Vyber dlžobu',
    art: '💊',
    text: [
      '"Ferdo Šárošy — díler na sídlisku Necpaly. Dlhuje 3 týždne, 1200 kreditov. Tvoja úloha: vyber to."',
      '"Spôsob? Tvoj. Bít, presvedčiť, vystrašiť — ale priniesti peniaze. Reward: 1200₿ + 15 reputácia."',
      'Karina si zapáli. "Ferdo je u sestry. Bývanie 4. poschodie, č. 12. Žltý vchod od pošty."',
    ],
    choices: [
      { text: '"Beriem to. Idem." [Akceptovať + ísť]',
        action: function(){ FactionsSystem.activateQuest('stokari', 'collect_debt'); showNotif('⚔ Quest aktívny: Šárošy dlhuje'); },
        next: 'fac_stokari_quest_door' },
      { text: '← Neskôr', next: 'fac_stokari_garaze' }
    ]
  },

  fac_stokari_quest_door: {
    name: 'Stokári // Necpaly — Dvere č. 12',
    art: '🚪',
    text: [
      'Pri dverách. Číslo 12, žltý vchod od pošty. Z bytu počuť TV — zápas, hlučné komentátorky.',
      'Klepáš. Po chvíľke sa otvorí — vytiahnutý chlap, mokré tričko, oči rozšírené. Šárošy.',
      '"Čo? Tu je byt mojej sestry. Čo chceš?"',
      '',
      '// [VOĽBA] Tri prístupy: hrubá sila, sociálne presvedčenie, alebo blefové vyhrážanie. //',
    ],
    onEnter: function(){ S.flags['stokari_quest_at_door'] = true; },
    choices: [
      { text: '🥊 "Karina ťa pozdravuje." [SILA — Bit]',
        cond: function(){ return S.str >= 20; },
        condFail: 'Potrebuješ STR ≥ 20 — choď do gymu.',
        next: 'fac_stokari_quest_bit' },
      { text: '🗣 "Vieme čo robíš s peniazmi za stenkou." [PERSUADE]',
        next: 'fac_stokari_quest_persuade' },
      { text: '👻 "Stokári chcú prachy. Inak vieme kde býva tvoja sestra v Topoľčanoch." [HROZBA]',
        next: 'fac_stokari_quest_threat' },
      { text: '← Späť', next: 'fac_stokari_garaze' }
    ]
  },

  fac_stokari_quest_bit: {
    name: 'Stokári // Šárošy — Bitka',
    art: '🥊',
    text: [
      'Šárošy nestihne nič povedať. Dva direkty — prvý do brucha, druhý do brady. Padá ako vrece zemiakov.',
      '"DOSŤ! DOSŤ!" Krváca z nosa. "Mám to. Mám to v skrini. Ber si všetko, len daj pokoj."',
      '',
      '// V skrini: 1200₿ kešu + nejaké tabletky Sparta-15. //',
      '// ▲ HP −5 (boj) · STR +1 //',
    ],
    onEnter: function(){
      S.hp = Math.max(0, S.hp - 5);
      S.str = Math.min(100, S.str + 1);
      S.money += 1200;
      Renderer.updateStats(); Renderer.updateMoney();
      FactionsSystem.completeQuest('stokari', 'collect_debt');
      // bonus za silový prístup
      FactionsSystem.addRep('stokari', 3, 'sila — efektívne');
      addLog('Šárošy zbitý. +1200₿. STR +1. HP −5.', 'ok');
    },
    choices: [{ text: '← Späť do garáže', next: 'fac_stokari_garaze' }]
  },

  fac_stokari_quest_persuade: {
    name: 'Stokári // Šárošy — Persuade',
    art: '🗣',
    text: [
      '"Vieš čo? Si chytrý. Vidím tvoju sestru — má dve deti. Lebo TY si dílerom v jej byte." Pauza.',
      '"Karina to ešte nevie. Ja jej to môžem nepovedať. Alebo môžem."',
      '',
      'Šárošy zbledne. "Dobre. Dobre. Mám 800. Ostatné dlžem ja niekomu inému, dostanem v utorok. Beriem celých 1200, daj mi 4 dni."',
      '',
      '// [VOĽBA] Veriť mu? Alebo brať teraz čo dá? //',
    ],
    choices: [
      { text: '"Daj 800. V utorok beriem 400. A pokoj." [Trust]',
        next: 'fac_stokari_quest_persuade_trust' },
      { text: '"Teraz 800. Zvyšok je tvoj problém s Karinou." [Walk]',
        next: 'fac_stokari_quest_persuade_walk' }
    ]
  },

  fac_stokari_quest_persuade_trust: {
    name: 'Stokári // Šárošy — Veriť',
    art: '🤝',
    text: [
      'Po štyroch dňoch — Šárošy doniesie 400. Plus extra 100 ako gesto.',
      '"Ďakujem že si mi nezbalil sestrina deti. To si zapamätám."',
      '',
      '// ▲ +1300₿ celkom · +1 EMPATIA flag //',
    ],
    onEnter: function(){
      S.money += 1300;
      Renderer.updateMoney();
      S.flags['empathy_path'] = true;
      FactionsSystem.completeQuest('stokari', 'collect_debt');
      FactionsSystem.addRep('stokari', 5, 'persuasion — extra');
      addLog('Šárošy: 1300₿ + úcta. Stokári +5 bonus rep.', 'ok');
    },
    choices: [{ text: '← Späť do garáže', next: 'fac_stokari_garaze' }]
  },

  fac_stokari_quest_persuade_walk: {
    name: 'Stokári // Šárošy — Pragmatik',
    art: '💵',
    text: [
      '"Pragmatik. Mám rád pragmatikov." Šárošy ti odpočíta 800.',
      'Karina sa usmeje keď jej donesieš. "Pragmatik. Rozumieš obchodu."',
      '',
      '// ▲ +800₿ · Quest splnený, ale nie maximálny //',
    ],
    onEnter: function(){
      S.money += 800;
      Renderer.updateMoney();
      FactionsSystem.completeQuest('stokari', 'collect_debt');
      addLog('Šárošy: 800₿. Quest splnený.', 'ok');
    },
    choices: [{ text: '← Späť do garáže', next: 'fac_stokari_garaze' }]
  },

  fac_stokari_quest_threat: {
    name: 'Stokári // Šárošy — Hrozba',
    art: '👻',
    text: [
      'Šárošy ti nadáva ale ide po peniaze. Hodí ti hrubý balík cez stôl. 1200, na korunu.',
      '"Choď do riti. A povedzte Karine že robím v utorok znova ako máme dohodu."',
      '',
      'Vidíš že má strach z Kariny. Reálny strach.',
      '',
      '// ▲ +1200₿ · −2 SAN (cítiš sa špinavo) //',
    ],
    onEnter: function(){
      S.money += 1200;
      S.san = Math.max(0, S.san - 2);
      Renderer.updateStats(); Renderer.updateMoney();
      FactionsSystem.completeQuest('stokari', 'collect_debt');
      addLog('Šárošy zaplatil pod hrozbou. SAN −2.', 'ok');
    },
    choices: [{ text: '← Späť do garáže', next: 'fac_stokari_garaze' }]
  },

  // ── HACKERI QUEST: FIT známky ─────────────────────────
  fac_hackers_quest_intro: {
    name: 'Hackeri // Quest: FIT známky',
    art: '💻',
    text: [
      '"Akademický rok končí. Traja z nás potrebujú vyšší priemer pre štipendium."',
      '"Backend FIT // student records. Subtle — žiadne 1.0 z ničoho. Plus 0.3 max. Toľko aby filter neprepadol."',
      '"Postup: prelomiť sa cez SSH minihru, nájsť záznamy, prepísať."',
    ],
    choices: [
      { text: '"Beriem to. Otvor terminál." [Akceptovať + Minihra]',
        action: function(){
          FactionsSystem.activateQuest('hackers', 'fit_grades');
          showNotif('⚔ Quest aktívny: Hackni FIT známky');
          // okamžite spustí terminálovú minihru v special mode
          if (typeof TerminalOpsMinigame !== 'undefined') {
            S.flags['hackers_quest_in_progress'] = true;
            TerminalOpsMinigame.open();
          }
        },
        next: 'fac_hackers_quest_inprogress' },
      { text: '← Neskôr', next: 'fac_hackers_lab' }
    ]
  },

  fac_hackers_quest_inprogress: {
    name: 'Hackeri // Quest in Progress',
    art: '💻',
    text: [
      '// Po splnení Terminal Ops sa vráť sem pre uzavretie kontraktu //',
      '',
      'Oravec sleduje cez kameru. "Ak si prešiel SSH cez 3 levely, máš prístup k recordsu. Klikni nižšie pre dokončenie."',
    ],
    choices: [
      { text: '✓ Mám prístup. Prepísať známky.',
        cond: function(){ return (S.factions && S.factions.minigameStats && S.factions.minigameStats.hackers >= 1); },
        condFail: 'Najprv úspešne dokonči Terminal Ops minihru.',
        next: 'fac_hackers_quest_done' },
      { text: '🟢 Spustiť Terminal Ops znova',
        action: function(){ if (typeof TerminalOpsMinigame !== 'undefined') TerminalOpsMinigame.open(); },
        next: 'fac_hackers_quest_inprogress' },
      { text: '← Neskôr', next: 'fac_hackers_lab' }
    ]
  },

  fac_hackers_quest_done: {
    name: 'Hackeri // Quest splnený',
    art: '💻',
    text: [
      'Tri záznamy prepísané. +0.2, +0.3, +0.15. Žiadny audit alarm. Filter prešiel.',
      'Oravec ti pošle zašifrovanú správu: "Money is in. Welcome to the inner ring."',
      '',
      '// ▲ +1500₿ · +30 XP · +15 rep Hackeri · +3 hackStat //',
    ],
    onEnter: function(){
      S.money += 1500;
      gainXP(30);
      S.hackStat = Math.min(100, S.hackStat + 3);
      Renderer.updateStats(); Renderer.updateMoney();
      FactionsSystem.completeQuest('hackers', 'fit_grades');
      addLog('FIT známky prepísané. +1500₿, +3 hackStat.', 'ok');
    },
    choices: [{ text: '← Späť do Lab B7', next: 'fac_hackers_lab' }]
  },

  // ── CEO QUEST: Vydieranie politika ─────────────────────
  fac_ceo_quest_blackmail_intro: {
    name: 'CEO // Quest: Politik',
    art: '🎩',
    text: [
      '"Marián Záhumenský — poslanec NR SR za stred. Hlasoval proti regulácii LAZARUS. Niekto mu zaplatil. Náš zdroj má pôvodný transfer."',
      '"Kompromitát: foto + bankový výpis. Tvoja úloha: doručiť mu balík a vybrať odpoveď."',
      '',
      'Tomáš ti hodí USB cez stôl. "Tu je dôkaz. Stretneš sa s ním v hoteli Magnólia v Bratislave. Dnes. Vlak o 18:30 zo stanice."',
    ],
    choices: [
      { text: '"Beriem to. Idem na vlak." [Akceptovať]',
        action: function(){ FactionsSystem.activateQuest('ceo', 'blackmail'); showNotif('⚔ Quest aktívny: Záhumenský'); },
        next: 'fac_ceo_quest_meeting' },
      { text: '← Neskôr', next: 'fac_ceo_penthouse' }
    ]
  },

  fac_ceo_quest_meeting: {
    name: 'CEO // Hotel Magnólia',
    art: '🏨',
    text: [
      'Bratislava. Hotel Magnólia. Lobby. Politik sedí pri lampe — sám, malá vodka.',
      'Pristúpiš. Záhumenský zdvihne pohlad. "Nepoznám ťa."',
      '"Mám tu USB. Prevod 50000€ z účtu Bane Corp. shell company. December 2074. Deň pred LAZARUS hlasovaním."',
      '',
      'Dlhé ticho. Politik sa neuhne.',
      '',
      '// [VOĽBA] Ako pokračovať? //',
    ],
    choices: [
      { text: '💰 "5000₿ alebo to ide do tlače." [Tvrdé]',
        next: 'fac_ceo_quest_hard' },
      { text: '🤝 "Stačí ak hlasuješ za reformu LAZARUS budúci týždeň." [Politické]',
        next: 'fac_ceo_quest_political' },
      { text: '🚪 "Kupujeme si tvoju lojalitu — odteraz." [Long term]',
        next: 'fac_ceo_quest_loyalty' }
    ]
  },

  fac_ceo_quest_hard: {
    name: 'CEO // Quest — Tvrdé',
    art: '💰',
    text: [
      'Záhumenský sa zachveje. Ide na záchod, vráti sa s balíkom.',
      '"5000. Ber a zmizni."',
      '',
      'Tomáš ti pri stretnutí v penthousu doplní 3000 ako podiel.',
      '',
      '// ▲ +8000₿ · +15 rep CEO · −1 SAN //',
    ],
    onEnter: function(){
      S.money += 8000;
      S.san = Math.max(0, S.san - 1);
      Renderer.updateStats(); Renderer.updateMoney();
      FactionsSystem.completeQuest('ceo', 'blackmail');
      addLog('Politik zaplatil. +8000₿. SAN −1.', 'ok');
    },
    choices: [{ text: '← Späť do penthousu', next: 'fac_ceo_penthouse' }]
  },

  fac_ceo_quest_political: {
    name: 'CEO // Quest — Politické',
    art: '🤝',
    text: [
      'Politik sa zľakne — uvedomí si že mu nejde o peniaze. To je hrozné.',
      '"Dohoda. Hlasujem za. Ale toto USB nech zmizne."',
      '',
      'Tomáš je nadšený keď to počuje. "TOTO je hra na dlho. +5000₿ + politický kontakt na celý rok."',
      '',
      '// ▲ +5000₿ · +20 rep CEO (bonus) · politický kontakt //',
    ],
    onEnter: function(){
      S.money += 5000;
      S.flags['political_contact'] = true;
      Renderer.updateMoney();
      FactionsSystem.completeQuest('ceo', 'blackmail');
      FactionsSystem.addRep('ceo', 5, 'long-term play');
      addLog('Politik nas vlastní. +5000₿. Politický kontakt aktívny.', 'ok');
    },
    choices: [{ text: '← Späť do penthousu', next: 'fac_ceo_penthouse' }]
  },

  fac_ceo_quest_loyalty: {
    name: 'CEO // Quest — Lojalita',
    art: '🎩',
    text: [
      '"Lojalita?" Politik sa zasmeje, nervózne. "Vy ste — vy chcete čo presne?"',
      '"Mesačné stretnutie. Posúvate nám interný draft hlasovaní. Žiadne peniaze. Iba — vidíte, hovoríte."',
      '',
      'Záhumenský prikývne. "Dobre. Dobre. Som váš. Doslova."',
      '',
      'Tomáš ti pošle 4000₿ keď to počuje, plus permanentný bonus k CEO income.',
      '',
      '// ▲ +4000₿ · +25 rep CEO · +5₿/s permanentný bonus //',
    ],
    onEnter: function(){
      S.money += 4000;
      S.income.bonus = (S.income.bonus || 0) + 5;
      Renderer.updateMoney(); Renderer.updateIncome();
      FactionsSystem.completeQuest('ceo', 'blackmail');
      FactionsSystem.addRep('ceo', 10, 'loyalty pact — masterclass');
      S.flags['political_loyalty'] = true;
      addLog('Politik na poste. +4000₿. +5₿/s bonus permanentný.', 'ok');
    },
    choices: [{ text: '← Späť do penthousu', next: 'fac_ceo_penthouse' }]
  },

  // ── CEO QUEST: Pranie peňazí (auto-trackuje cez CasinoQuestTracker) ──
  fac_ceo_quest_laundry_intro: {
    name: 'CEO // Quest: Pranie peňazí',
    art: '🎰',
    text: [
      '"5000₿ špinavých z deal Stokárov — nemôžu cez normálnu banku. Casino: vsadíš, pretočíš, vypláti ti šek."',
      '"Reward: 6000₿ čistých + 15 reputácia."',
      '"Pravidlo: Blackjack alebo Slots. Minimum 5 kôl. Nemusíš vyhrať — len pretočiť. Casino tracker si všíma."',
      '',
      'Tomáš ti pridá 5000₿ ako pracovný kapitál na pranie. Tieto peniaze môžeš stratiť — ostatné neflukneš.',
    ],
    choices: [
      { text: '"Beriem. + 5000 kapitál" [Akceptovať]',
        action: function(){
          FactionsSystem.activateQuest('ceo', 'laundry');
          S.money += 5000;
          Renderer.updateMoney();
          showNotif('⚔ Pranie quest aktívny · +5000₿ kapitál');
        },
        next: 'fac_ceo_quest_laundry_go' },
      { text: '← Neskôr', next: 'fac_ceo_penthouse' }
    ]
  },

  fac_ceo_quest_laundry_go: {
    name: 'CEO // Choď do kasína',
    art: '🎰',
    text: [
      '"Choď do Miki bar — Lucia vie, je to schválené. Hraj 5 kôl Blackjack alebo Slots. Po 5 kolách quest sa automaticky uzavre."',
      '"Po splnení: +6000₿ čistých kreditom na účet. Reputácia +15."',
    ],
    choices: [
      { text: '🚶 Ísť do Miki bar (kasino)',
        next: 'loc_miki' },
      { text: '🃏 Otvoriť Blackjack rovno',
        action: function(){ if (typeof openBlackjack === 'function') openBlackjack(); },
        next: 'fac_ceo_penthouse' },
      { text: '🎰 Otvoriť Sloty rovno',
        action: function(){ if (typeof openSlots === 'function') openSlots(); },
        next: 'fac_ceo_penthouse' },
      { text: '← Neskôr', next: 'fac_ceo_penthouse' }
    ]
  },

  // ── RYBÁRI QUEST: Pavlíkov vrak ──────────────────────
  fac_rybari_quest_intro: {
    name: 'Rybári // Quest: Pavlíkov vrak',
    art: '🐟',
    text: [
      '"Pavlík minulý týždeň našiel kovový predmet pri brehu — vyzerá ako kus drónu. Bezpilotného. Asi vojenského."',
      '"Pre-zisti čo to je. Foto, polohu, sériák. Buď opatrný — možno to ešte vysiela."',
      'Fero ti dá súradnice na papieriku. "Pri tretej zátoke za vŕbou."',
    ],
    choices: [
      { text: '"Beriem to." [Akceptovať + ísť k vraku]',
        action: function(){ FactionsSystem.activateQuest('rybari', 'wreck'); showNotif('⚔ Quest aktívny: Pavlíkov vrak'); },
        next: 'fac_rybari_quest_wreck' },
      { text: '← Neskôr', next: 'fac_rybari_rameno' }
    ]
  },

  fac_rybari_quest_wreck: {
    name: 'Rybári // Tretia zátoka',
    art: '🛸',
    text: [
      'Tretia zátoka, za vŕbou. Vrak je tu — kovový kus, asi 60cm dlhý. Modrý lak, sériové číslo PK-A7-2074.',
      'Vyzerá ako drone — ale väčší ako bežný hobby. Vojenská alebo polo-vojenská kvalita.',
      '',
      '// [VNEM] Modré LED na boku stále bliká. Drobne. Vysiela. Niekde má parnera. //',
      '// [VOĽBA] //',
    ],
    onEnter: function(){
      gainXP(20);
      S.flags['drone_wreck'] = true;
    },
    choices: [
      { text: '📸 Foto + späť, nezasahovať [Bezpečné]',
        next: 'fac_rybari_quest_safe' },
      { text: '🔧 Vytiahnuť SD kartu [Riziko + reward]',
        cond: function(){ return S.hackStat >= 25; },
        condFail: 'Potrebuješ hackStat ≥ 25.',
        next: 'fac_rybari_quest_sd' },
      { text: '⚡ Skratovať vysielač [Sabotáž]',
        cond: function(){ return S.str >= 18; },
        condFail: 'Potrebuješ STR ≥ 18.',
        next: 'fac_rybari_quest_sabotage' }
    ]
  },

  fac_rybari_quest_safe: {
    name: 'Rybári // Quest — Foto',
    art: '📸',
    text: [
      'Vyfotil si všetko. Sériák, polohu, LED frekvenciu.',
      'Fero pozrie fotky. "PK-A7. To je interný kód. Pavlík sa raz vrátil z fabriky a hovoril o PK projekte."',
      '"Toto ide Druidovi. On vie čo s tým."',
      '',
      '// ▲ +1500₿ · +15 rep Rybári · stopa pre Druida //',
    ],
    onEnter: function(){
      S.money += 1500;
      Renderer.updateMoney();
      S.flags['rybari_drone_intel'] = true;
      FactionsSystem.completeQuest('rybari', 'wreck');
      addLog('Drone documented. +1500₿. Rybári +15 rep. Druid stopa.', 'ok');
    },
    choices: [{ text: '← Späť k Mŕtvemu Ramenu', next: 'fac_rybari_rameno' }]
  },

  fac_rybari_quest_sd: {
    name: 'Rybári // Quest — SD karta',
    art: '💾',
    text: [
      'Otvoríš panel. SD karta vibruje pod prstami — ešte je horúca.',
      'Vyhodíš ju, nasunieš do OTG adaptéra na svojom phone. 32GB. Decryption: AES-256, ale ty máš word list zo Stokárov.',
      '',
      '// 47 minút neskôr — odomknuté. //',
      '',
      'Logy: GPS súradnice 40+ patroliek. Sieťová mapa BANE CORP shell servers. A — najdrahší kus — 4 minútový audio záznam Tomáša ako objednáva drone strike na konkurenciu.',
      '',
      '// ▲ +3000₿ · +20 rep Rybári · −10 rep CEO (ak Tomáš zistí) · velký leak //',
    ],
    onEnter: function(){
      S.money += 3000;
      Renderer.updateMoney();
      S.flags['drone_sd_decrypted'] = true;
      FactionsSystem.completeQuest('rybari', 'wreck');
      FactionsSystem.addRep('rybari', 5, 'big leak');
      // CEO penalty — naškôcali sme im ich aktivá
      if (S.factions && S.factions.joined && S.factions.joined.ceo) {
        FactionsSystem.addRep('ceo', -10, 'leak Tomášovho audio');
      }
      addLog('SD dekryptovaná. Tomášove audio v rukách. +3000₿.', 'ok');
    },
    choices: [{ text: '← Späť k Mŕtvemu Ramenu', next: 'fac_rybari_rameno' }]
  },

  fac_rybari_quest_sabotage: {
    name: 'Rybári // Quest — Sabotáž',
    art: '⚡',
    text: [
      'Skrat. LEDka zhasne. Vysielač off-line.',
      'Niekde, niekto, na druhej strane sa stáva slepý — ale zúrivý.',
      '',
      'Po 20 minútach začujete drone vyšších frekvencií. Vrtuľník. Hľadajú.',
      'Pavlík ťa skryje pod loďkou. Ostávate pol hodiny ticho.',
      '',
      '// ▲ +1000₿ · +25 rep Rybári (zachránil prístav) · alarm flag //',
    ],
    onEnter: function(){
      S.money += 1000;
      Renderer.updateMoney();
      S.flags['drone_sabotage'] = true;
      S.flags['heat_level'] = (S.flags['heat_level']||0) + 1;
      FactionsSystem.completeQuest('rybari', 'wreck');
      FactionsSystem.addRep('rybari', 10, 'sabotáž — zachránil prístav');
      addLog('Drone offline. Heat +1. Rybári +25 rep.', 'ok');
    },
    choices: [{ text: '← Späť k Mŕtvemu Ramenu', next: 'fac_rybari_rameno' }]
  },


  // ── SCÉNY Z PREDCHÁDZAJÚCEJ VERZIE (Lucia, Jantar, Námestie, Squash, Stanica, FRI, Domov) ──

  loc_miki_lucia: {
    name: 'Miki Bar // Lucia',
    art: '🥃',
    text: [
      '<b>Lucia Horáková</b>. Barmanka.',
      'Pohybuje sa za barom ako keby bar patril jej — nie Igorovi.',
      'Keď sa pozrieš, neutečie ti pohľadom. Drží ho.',
      '',
      '"Čo dáš?" — Nie pozdrav. Nie otázka. Rozsudok.',
      '',
      '<i>// ELEKTROMORÁLKA: Táto žena videla veľa. A zabudla ešte viac. //',
    ],
    choices: [
      { text:'[A] „Slivovicu."',                               next:'loc_miki_lucia_slivo' },
      { text:'[B] „Nič. Len chcem vedieť — čo si ty za človek?"', next:'loc_miki_lucia_kto' },
      { text:'[C] „Pracuješ tu dlho?"',                        next:'loc_miki_lucia_dlho' },
      { text:'[D] „Počul si o LAZARUS protokole?"',            next:'loc_miki_lucia_lazarus',
        cond:function(){ return S.flags && S.flags['marek_kod']; }, condFail:'Ešte na to nie si pripravený.' },
      { text:'[E] Odísť',                                      next:'loc_miki' },
    ]
  },

  loc_miki_lucia_co_hladam: {
    name: 'Miki Bar // Lucia — Čo Hľadáš',
    art: '🔍',
    text: [
      'Odvrátila sa. Utiera pohár — ten istý pohár, tretíkrát.',
      '"Niekto — alebo niečo."',
      '"Možno oboje."',
      '"Ľudia čo hľadajú odpovede majú taký pohľad."',
      '"Unavený. Ale nie od spánku."',
      '',
      '"Videla som takýchto ľudí v záchranke."',
      '"Raz. Pred trom rokmi."',
      '"Hovoril divné veci. O signáloch. O frekvenciách."',
      '"Pol roka nato — nekrológ v novinách."',
      '',
      'Otočí sa. Pozrie na teba priamo.',
      '"Dávaj si pozor čo hľadáš. Niekedy to nájdeš."',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-5); updateStats(); gainXP(15); S.flags['lucia_varovanie']=true; },
    choices: [
      { text:'[A] „Ten muž — čo si zistila?"',      next:'loc_miki_lucia_pacient' },
      { text:'[B] „Nájdem to aj tak. Pomôžeš?"',    next:'loc_miki_lucia_pomoc' },
      { text:'[C] Objednáš ďalšiu slivovicu',       next:'loc_miki_lucia_slivo' },
    ]
  },

  loc_miki_lucia_dakujem: {
    name: 'Miki Bar // Lucia — Rozlúčenie',
    art: '🚪',
    text: [
      '"Ďakujem."',
      '',
      'Lucia si vezme pohár — ten čo utierala celý večer.',
      'Konečne ho odloží na policu.',
      '"Vráť sa," hovorí.',
      '"Ak budeš môcť."',
      '',
      'Nie: "Veľa šťastia."',
      'Nie: "Daj si pozor."',
      'Len: "Vráť sa."',
      '',
      '<i>// Niekedy je to dostatok. //',
    ],
    onEnter: function(){ S.san=Math.min(100,S.san+6); updateStats(); gainXP(10); },
    choices: [
      { text:'[A] Ísť na operáciu', next:'start' },
      { text:'[B] Zostať v bare',   next:'loc_miki' },
    ]
  },

  loc_miki_lucia_dlho: {
    name: 'Miki Bar // Lucia — Dĺžka',
    art: '🕰️',
    text: [
      '"Tri roky." Ani sa nad tým nezamyslí.',
      '"Igor ma zobral keď som potrebovala prácu a on potreboval niekoho,',
      'kto sa nebojí nočných zákazníkov."',
      '',
      '"Nočných?" opýtaš sa.',
      '',
      '"Tých čo prichádzajú po jednej."',
      '"Nie za drinkom."',
      'Pohľad na dvere — rýchly, zvykový.',
      '"Za informáciami."',
      '',
      '<i>// Lucia vie viac ako hovorí. Čo nepovie Igorovi — povie poháriku. //',
    ],
    onEnter: function(){ gainXP(10); S.flags['lucia_noc_hint']=true; },
    choices: [
      { text:'[A] „Aké informácie?"',                next:'loc_miki_lucia_info_noc' },
      { text:'[B] „A ty — dávaš im čo chcú?"',      next:'loc_miki_lucia_rola' },
      { text:'[C] Objednáš slivovicu',               next:'loc_miki_lucia_slivo' },
    ]
  },

  loc_miki_lucia_dovody: {
    name: 'Miki Bar // Lucia — Dôvody',
    art: '🌑',
    text: [
      '"Dôvody." Naleje si sama. Malý lok.',
      '"Záchranárka vidí ľudí na najhoršom mieste ich života."',
      '"Tri roky. Každý deň. Potom jeden deň — nemôžeš zastaviť."',
      '"Len stojíš a pozeráš."',
      '"A systém ti povie, že si urobila čo si mohla."',
      '',
      '"Bar je jednoduchší." Pohľad na pohár.',
      '"Tu si sám zodpovedný za to čo dáš."',
      '"Nie za to čo nevezmeš."',
      '',
      '<i>// EMPATHY: Hanba a úľava v rovnakom pohári. //',
    ],
    onEnter: function(){ gainXP(12); S.flags['lucia_burnout']=true; },
    choices: [
      { text:'[A] „Čo si nemohla zastaviť?"',    next:'loc_miki_lucia_pacient' },
      { text:'[B] Mlčíš. Rozumieš.',             next:'loc_miki_lucia_mlcanie' },
    ]
  },

  loc_miki_lucia_info_noc: {
    name: 'Miki Bar // Lucia — Nočné Informácie',
    art: '🌙',
    text: [
      '"Aké informácie." Tón: nie otázka. Registrácia.',
      '"Závisí čo potrebujú."',
      '"Niektorí chcú vedieť či niekto tu sedel. Kedy odišiel."',
      '"Iní chcú vedieť — čo povedal."',
      '"Barmanka je neviditeľná. Ľudia zabudnú, že tu som."',
      '"A ja nezabúdam."',
      '',
      'Utiera pohár. Ten istý pohár.',
      '"Čo chceš vedieť ty?"',
    ],
    onEnter: function(){ gainXP(8); },
    choices: [
      { text:'[A] „Čo vieš o zákazníkoch po jednej ráno?"', next:'loc_miki_lucia_zakaznik' },
      { text:'[B] „Čo vieš o Vtáčniku?"',                   next:'loc_miki_lucia_vtacnik' },
      { text:'[C] „Vieš o LAZARUS?"',                        next:'loc_miki_lucia_lazarus',
        cond:function(){ return S.flags && S.flags['marek_kod']; }, condFail:'Toto slovo tu nespomínaj nadarmo.' },
    ]
  },

  loc_miki_lucia_kedy: {
    name: 'Miki Bar // Lucia — Kedy',
    art: '📅',
    text: [
      '"Kedy." Zamyslí sa. "Trinásty október. Štvrtok."',
      '"Ráno. Piata hodina — ešte šero."',
      '"Presne o mesiac neskôr — zmizol Tibor Mach."',
      '"Elektrikár. Pracoval na Vtáčniku."',
      '"Poznala som ho — chodil sem raz za týždeň."',
      '"Vždy sám. Vždy rovnaký stôl."',
      '"Posledný raz tu sedel tri dni pred tým ako zmizol."',
      '"Povedal: \'Lucia, ak sa stratím — v šuflíku za barom je obálka.\'"',
      '',
      'Odmlčí sa.',
      '"Obálka tam stále je."',
    ],
    onEnter: function(){ gainXP(25); S.flags['lucia_obalka']=true; addLog('Stopa: obálka od Tibora Macha za barom!','ok'); showNotif('Tibor Mach zanechal obálku Lucii!'); },
    choices: [
      { text:'[A] „Môžem vidieť tú obálku?"', next:'loc_miki_lucia_obalka_otvor' },
      { text:'[B] „Prečo si to nepovedala skôr?"', next:'loc_miki_lucia_preco_mlcala' },
    ]
  },

  loc_miki_lucia_klamstvo: {
    name: 'Miki Bar // Lucia — Klamstvo',
    art: '😶',
    text: [
      '"Len zákazník." Opakuje pomaly.',
      'Pohár ide na policu. Utierka na pult.',
      '"Iste."',
      '',
      'Otočí sa chrbtom.',
      '"Ďalší drink bude sto kreditov."',
    ],
    onEnter: function(){ addLog('Lucia ti neverí. Cena zdvojnásobená.','warn'); },
    choices: [
      { text:'[A] Povedať pravdu',           next:'loc_miki_lucia_pravda' },
      { text:'[B] Odísť',                   next:'loc_miki' },
    ]
  },

  loc_miki_lucia_kto: {
    name: 'Miki Bar // Lucia — Kto si',
    art: '🌑',
    text: [
      'Zastaví sa. Položí utierku.',
      '"Zaujímavá otázka. Zvyčajne pýtajú čo mám, nie kto som."',
      '',
      'Opiera sa o bar. Pozerá na teba — nie ako na zákazníka.',
      '"Lucia. Horáková. Barmanka, ak musíš mať titul."',
      '"Predtým: záchranárka na záchranke v Bojniciach. Tri roky."',
      '"Potom — jeden večer, jeden pacient, jeden prípad čo sa uzavrel príliš rýchlo."',
      '"A tu som."',
      '',
      '<i>// EMPATHY: Za poslednou vetou je niekoľko rokov hniezda. //',
    ],
    onEnter: function(){ gainXP(12); S.flags['lucia_historia']=true; },
    choices: [
      { text:'[A] „Čo sa stalo s tým pacientom?"', next:'loc_miki_lucia_pacient' },
      { text:'[B] „Prečo bar? Prečo práve sem?"',  next:'loc_miki_lucia_preco' },
      { text:'[C] Objednáš slivovicu',             next:'loc_miki_lucia_slivo' },
    ]
  },

  loc_miki_lucia_lazarus: {
    name: 'Miki Bar // Lucia — LAZARUS',
    art: '⚠️',
    text: [
      'Utierka padne na bar.',
      '"LAZARUS." Tichšie ako čokoľvek predtým.',
      '',
      '"Ten muž z nemocnice — pred tým ako ho prepustili —"',
      '"— šeptal to slovo. Znova a znova."',
      '"Myslela som, že blúzni."',
      '',
      '"Potom som to počula ešte raz. Tu. Zákazník po jednej ráno."',
      '"Hovoril do telefónu. Myslel, že nič nepočujem."',
      '"\'LAZARUS uzol aktívny. Štvrtá hodina potvrdzuje.\'"',
      '',
      '"Neviem čo je LAZARUS."',
      '"Ale viem, že ľudia čo ho spomínajú — miznú, alebo zomierajú."',
      '"Takže tebe — tebe to poviem iba raz:"',
      '"Ak chceš žiť — zabudni na to slovo."',
      '"Ak nechceš —" Pohľad dolu na bar. "— obálka je tam."',
    ],
    onEnter: function(){ gainXP(20); S.flags['lucia_lazarus_vie']=true; addLog('Lucia potvrdila LAZARUS. Uzol. Štvrtá hodina.','ok'); if(!S.flags['lucia_obalka']) S.flags['lucia_obalka']=true; },
    choices: [
      { text:'[A] „Obálka — ukáž mi ju."',              next:'loc_miki_lucia_kedy' },
      { text:'[B] „Čo si videla na Vtáčniku?"',         next:'loc_miki_lucia_vtacnik' },
      { text:'[C] „Kto bol ten zákazník po jednej?"',   next:'loc_miki_lucia_zakaznik' },
    ]
  },

  loc_miki_lucia_mlcanie: {
    name: 'Miki Bar // Lucia — Mlčanie',
    art: '🕯️',
    text: [
      'Mlčíte.',
      'Bar je takmer prázdny. Igor niekde vzadu.',
      '',
      'Lucia utiera ten istý pohár. Ty piješ.',
      '',
      'Po chvíli: "Je doskoré, alebo neskoro?"',
      '"Závisí od toho, odkiaľ idieš," odpovieš.',
      '',
      '"To je múdra odpoveď," hovorí.',
      '"Alebo zbabelá."',
      '"Závisí od toho, odkiaľ idieš," zopakuje tvoje slová.',
      '"Rovnaká odpoveď. Iný problém."',
    ],
    onEnter: function(){ S.san=Math.min(100,S.san+8); updateStats(); gainXP(5); addLog('SAN +8. Chvíľa ticha v bare.','ok'); },
    choices: [
      { text:'[A] Odísť',                next:'loc_miki' },
      { text:'[B] „Ešte jedno."',        next:'loc_miki_lucia_slivo' },
    ]
  },

  loc_miki_lucia_nahlasila: {
    name: 'Miki Bar // Lucia — Nahlásenie',
    art: '📋',
    text: [
      '"Nahlásila." Krátky smiech — bez humoru.',
      '"Primárovi. Riaditeľovi. Hygienickej stanici."',
      '"A potom ma povolali do kancelárie."',
      '"Muž v obleku. Nie lekár. Nie z nemocnice."',
      '"Povedal mi, že som unavená. Že pracujem príliš tvrdo."',
      '"Že by som si mala vziať dovolenku."',
      '"A že môj pracovný kontrakt — sa dá prehodnotiť."',
      '',
      '"Na druhý deň mi povedali, že záchranársky post bol zrušený."',
      '"Rozpočtové škrty."',
      '"Samozrejme."',
      '',
      '<i>// AUTHORITY: Systém niekedy nepotrebuje pohroziť. Stačí naznačiť. //',
    ],
    onEnter: function(){ gainXP(18); S.san=Math.max(0,S.san-5); updateStats(); S.flags['lucia_vyhodena']=true; addLog('Lucia bola umlčaná. Stopa Vtáčnik-nemocnica.','ok'); },
    choices: [
      { text:'[A] „Ten muž v obleku — pamätáš si ho?"', next:'loc_miki_lucia_obleceny' },
      { text:'[B] „Čo vieš o LAZARUS?"',               next:'loc_miki_lucia_lazarus' },
      { text:'[C] Mlčíš. Dosť si počul.',               next:'loc_miki_lucia_mlcanie' },
    ]
  },

  loc_miki_lucia_obalka_otvor: {
    name: 'Miki Bar // Tibora Obálka',
    art: '📬',
    text: [
      'Vytrhne obálku zo šuflíka. Neotvorenú.',
      '"Nechcela som vedieť čo v nej je."',
      '"Ak viem — som zapojená. Ak neviem — som len barmanka."',
      '',
      'Podá ti ju.',
      '"Teraz ty rozhoduj."',
      '',
      'Otvoríš. Vnútri — ručne písaná stránka a kľúč.',
      '"UZOL 7 — VTÁČNIK OMEGA CORE. Prístupový kód: <b>DELTA-9-ECHO</b>."',
      '"Záložný vstup — bočné dvere bunkra. Ak sa niečo stane."',
      '<i>// Získal si kód DELTA-9-ECHO a kľúč záložného vstupu. //',
    ],
    onEnter: function(){ gainXP(35); addItem('keycard'); S.flags['delta9echo']=true; addLog('Záložný kód DELTA-9-ECHO. Keycard záložný vstup.','ok'); showNotif('Tibor Mach: kód DELTA-9-ECHO + keycard bočného vstupu!'); },
    choices: [
      { text:'[A] „Ďakujem, Lucia. Toto zachráni životy."', next:'loc_miki_lucia_dakujem' },
      { text:'[B] Ísť do bunkra',                          next:'bunker',
        cond:function(){ return hasItem('spis'); }, condFail:'Potrebuješ aj spis OMEGA.' },
    ]
  },

  loc_miki_lucia_obleceny: {
    name: 'Miki Bar // Lucia — Muž v Obleku',
    art: '🕵️',
    text: [
      '"Pamätám si každého, koho stretnem. Profesionálna deformácia."',
      '"Vysoký. Šedivý. Hovoril bez prízvuku — čo je samo o sebe prízvuk."',
      '"A mal — tu."',
      'Ukazuje za ľavé ucho.',
      '"Jemná jazva. Operačná. Nie úraz."',
      '"Implantát?"',
      '"Možno." Pozrie na teba. "Ty tiež sleduješ uši ľudí?"',
      '',
      '<i>// PERCEPTION: Koordinátor LAZARUS. Alebo niekto z jeho tímu. //',
    ],
    onEnter: function(){ gainXP(25); S.flags['lucia_jazva']=true; addLog('Stopa: jazva za uchom = implantát. Koordinátor?','ok'); showNotif('Nová stopa: jazva za uchom — implantát LAZARUS?'); },
    choices: [
      { text:'[A] „Vieš kde ten muž pracuje?"',  next:'loc_miki_lucia_lazarus' },
      { text:'[B] „Ďakujem. Toto je dôležité."', next:'loc_miki_lucia_dakujem' },
    ]
  },

  loc_miki_lucia_otec: {
    name: 'Miki Bar // Lucia — Otec',
    art: '🌲',
    text: [
      '"Otec." Krátka pauza.',
      '"Je živý. V Zliechove. Robí slivovicu a číta noviny."',
      '"Hovorí, že noviny klamú."',
      '"A slivovica nikdy."',
      '"Asi má pravdu v oboch prípadoch."',
      '',
      'Malý úsmev. Prvý skutočný úsmev od začiatku rozhovoru.',
      '"Chodím k nemu raz za mesiac."',
      '"On pýta: \'Kedy prestaneš robiť v bare?\'"',
      '"Ja pýtam: \'Kedy prestaneš robiť slivovicu?\'"',
      '"Nikto z nás neodpovie."',
      '"Tak si dáme pohár a pozrieme sa na lúku."',
    ],
    onEnter: function(){ S.san=Math.min(100,S.san+5); updateStats(); gainXP(8); },
    choices: [
      { text:'[A] „Daj mi ďalšiu slivovicu."',    next:'loc_miki_lucia_slivo' },
      { text:'[B] Vrátiť sa k témam',              next:'loc_miki_lucia_preco' },
    ]
  },

  loc_miki_lucia_pacient: {
    name: 'Miki Bar // Lucia — Pacient',
    art: '🚑',
    text: [
      'Dlhá pauza. Nie preto, že nechce povedať.',
      'Preto, že ešte vždy hľadá správne slová.',
      '',
      '"Muž. Päťdesiat rokov. Priviezli ho z Vtáčnika."',
      '"Elektromagnetická expozícia — tak to napísali."',
      '"Hovoril o zvukoch. O frekvenciách čo necítil uchami."',
      '"O tom, že vidí siete — nie pavúčie — niečo iné. V ľuďoch."',
      '',
      '"Diagnóza: akútna psychóza. Liečba: medikamenty a mlčanie."',
      '"O týždeň prepustený. Za mesiac mŕtvy — mozgová príhoda."',
      '"Päťdesiatjeden rokov."',
      '',
      '<i>// LOGIC: To isté ako Evin otec. Rovnaký vek. Rovnaké miesto. //',
    ],
    onEnter: function(){ gainXP(20); S.san=Math.max(0,S.san-8); updateStats(); S.flags['lucia_pacient_vtacnik']=true; addLog('SAN -8. Vzorec: Vtáčnik — expozícia — smrť.','warn'); },
    choices: [
      { text:'[A] „Nahlásila si to?"',               next:'loc_miki_lucia_nahlasila' },
      { text:'[B] „Prečo si prišla sem?"',           next:'loc_miki_lucia_preco' },
      { text:'[C] „Vieš o LAZARUS?"',                next:'loc_miki_lucia_lazarus',
        cond:function(){ return S.flags && (S.flags['marek_kod'] || S.flags['lucia_pacient_vtacnik']); }, condFail:'...' },
    ]
  },

  loc_miki_lucia_pomoc: {
    name: 'Miki Bar // Lucia — Pomoc',
    art: '🤝',
    text: [
      'Dlhá pauza.',
      '"Pomôcť." Opakuje slovo ako keby ho skúšala.',
      '',
      '"Viem jedno miesto. Kde tí zákazníci čo prichádzajú po jednej — kde idú potom."',
      '"Nie domov. Smerom na Vtáčnik."',
      '"Chodník pri cintoríne vedie ku starému lesníkovi."',
      '"Za posledné dva mesiace som videla tri autá bez ŠPZ ísť tou cestou."',
      '"Vracali sa vždy. Ľudia čo išli s nimi — nie vždy."',
      '',
      '"To je všetko čo viem." Pohľad ku dverám. "To je všetko čo ti poviem."',
    ],
    onEnter: function(){ gainXP(22); S.flags['lucia_cesta_vtacnik']=true; addLog('Stopa od Lucie: cesta cez cintorín na Vtáčnik.','ok'); showNotif('Lucia: cesta ku Vtáčniku cez cintorín'); },
    choices: [
      { text:'[A] Ísť do jaskýň (Vtáčnik)',         next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
      { text:'[B] „Ďakujem. Naozaj."',              next:'loc_miki_lucia_dakujem' },
    ]
  },

  loc_miki_lucia_pravda: {
    name: 'Miki Bar // Lucia — Pravda',
    art: '💡',
    text: [
      'Povedáš jej. Nie všetko. Dosť.',
      '',
      'Keď skončíš — mlčí.',
      '"Tak." Vydýchne. "Nakoniec niekto."',
      '"Vedela som, že raz niekto príde a spýta sa správne otázky."',
      '"Len som nevedela — kedy."',
      '"A dúfala som, že to bude skôr."',
      '',
      '"Tibor mal pravdu. Existuje obálka."',
      '"A ja ti ju dám."',
    ],
    onEnter: function(){ gainXP(20); S.flags['lucia_dovera']=true; addLog('Lucia ti dôveruje. Prístup k obálke.','ok'); },
    choices: [
      { text:'[A] „Obálka — kde je?"', next:'loc_miki_lucia_obalka_otvor' },
    ]
  },

  loc_miki_lucia_preco: {
    name: 'Miki Bar // Lucia — Prečo Sem',
    art: '🌧️',
    text: [
      '"Prečo sem." Zopakuje otázku ako keby ju skúšala na váhu.',
      '',
      '"Prievidza je dosť malá na to, aby si vždy vedel čo sa deje."',
      '"A dosť veľká na to, aby ti nikto neveril keď to povieš."',
      '"Ideálna kombinácia pre niekoho ako som ja."',
      '',
      '"Igor nepýta otázky. Bar zavrie o štvrtej."',
      '"A každý, kto sem príde — príde z dôvodu. Nie zo zvyku."',
      '"Zákazníci zo zvyku chodia domov."',
      '"Tí čo sem chodia — hľadajú niečo."',
      '',
      '"Ty tiež."',
      'Nie otázka.',
    ],
    onEnter: function(){ gainXP(10); },
    choices: [
      { text:'[A] „Čo hľadám podľa teba?"',       next:'loc_miki_lucia_co_hladam' },
      { text:'[B] Objednáš slivovicu',             next:'loc_miki_lucia_slivo' },
      { text:'[C] „Čo vieš o noci na Vtáčniku?"', next:'loc_miki_lucia_vtacnik' },
    ]
  },

  loc_miki_lucia_preco_mlcala: {
    name: 'Miki Bar // Lucia — Prečo Mlčala',
    art: '🤐',
    text: [
      'Nezamkne pohľad. Neodvracia sa.',
      '"Preto, že som sa bála."',
      '"Nie za seba. Za Tibora som sa bála pred mesiacom."',
      '"Teraz je Tibor preč. A báť sa za mŕtveho nemá zmysel."',
      '"Zostávam báť sa za živých."',
      '',
      'Pozrie na teba.',
      '"Ty si živý. Zatiaľ."',
      '"A môžeš ísť tam kde ja nemôžem."',
      '"Tak choď."',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-5); updateStats(); gainXP(10); },
    choices: [
      { text:'[A] Ísť do jaskýň',  next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky sa nevrátiš.' },
      { text:'[B] Zostávaš chvíľu', next:'loc_miki_lucia_mlcanie' },
    ]
  },

  loc_miki_lucia_rola: {
    name: 'Miki Bar // Lucia — Jej Rola',
    art: '🎭',
    text: [
      '"Dávam im čo chcú?" Krátky pohľad. "Niekedy."',
      '"Drink — áno. Informáciu — závisí od toho, komu."',
      '"Naposledy som dala \'informáciu\' chlapovi čo mi klamal do očí."',
      '"Povedal, že hľadá stratenú priateľku."',
      '"Mal prsteň na prste."',
      '"Dostal fľašu minerálky a adresu záchranky."',
      '',
      '"Kto si ty?"',
      'Priamy pohľad. Čaká.',
      '<i>// COMPOSURE: Táto žena číta klamstvo ako text. //',
    ],
    onEnter: function(){ gainXP(10); },
    choices: [
      { text:'[A] Povedať pravdu',              next:'loc_miki_lucia_pravda' },
      { text:'[B] „Som len zákazník."',         next:'loc_miki_lucia_klamstvo' },
      { text:'[C] „Som ten, kto zastaví LAZARUS."', next:'loc_miki_lucia_lazarus',
        cond:function(){ return S.flags && S.flags['marek_kod']; }, condFail:'Nie si ešte pripravený.' },
    ]
  },

  loc_miki_lucia_slivo: {
    name: 'Miki Bar // Lucia — Slivovica',
    art: '🥃',
    text: [
      'Naleje bez toho, aby sa pozrela na pohár. Vie kde je.',
      '"Päťdesiat." Pohár pristane pred tebou bez rozpláchnutia.',
      '',
      'Slivovica je dobrá. Príliš dobrá na to, aby bola od Igora.',
      '"Tvoja?" spýtaš sa.',
      '',
      'Prvý raz sa usmiala. Nie priateľsky — skôr ako keby si povedal niečo správne.',
      '"Domáca. Z dediny pri Zliechove."',
      '"Môj otec robil. Teraz robím ja."',
      '"On prestal. Z iných dôvodov ako ja začala."',
    ],
    onEnter: function(){
      if(S.money>=50){ S.money-=50; S.san=Math.min(100,S.san+10); updateMoneyDisplay(); updateStats(); addLog('Luciina slivovica: -50₿, SAN +10.','ok'); gainXP(8); S.flags['lucia_slivo']=true; }
      else { addLog('Nemáš dosť.','warn'); }
    },
    choices: [
      { text:'[A] „Z akých dôvodov si začala ty?"',    next:'loc_miki_lucia_dovody' },
      { text:'[B] „Tvoj otec — čo mu je?"',            next:'loc_miki_lucia_otec' },
      { text:'[C] Mlčíš a piješ',                      next:'loc_miki_lucia_mlcanie' },
    ]
  },

  loc_miki_lucia_vtacnik: {
    name: 'Miki Bar // Lucia — Vtáčnik',
    art: '⛰️',
    text: [
      '"Vtáčnik." Pohár siahol na policu a zastal tam.',
      '',
      '"Chodím tam behať. Chodila som. Prestala som pred rokom."',
      '"Nie preto, že by som bola lenivá."',
      '"Preto, že raz ráno — pri východe slnka —"',
      '"— zazrela som na vrchole skupinu ľudí."',
      '"Stáli v kruhu. Ticho. Nikto sa nehýbal."',
      '"Jeden sa otočil a pozrel dolu. Na mňa."',
      '"Príliš ďaleko na to, aby som videla tvár."',
      '"Dosť blízko na to, aby som vedela — nebol tam náhodou."',
      '',
      '<i>// ENCYCLOPEDIA: Kruhové zhromaždenia pri uzlových bodoch. LAZARUS aktivácie? //',
    ],
    onEnter: function(){ gainXP(15); S.flags['lucia_vtacnik_kruh']=true; S.san=Math.max(0,S.san-8); updateStats(); addLog('SAN -8. Lucia videla ceremóniu na Vtáčniku.','warn'); },
    choices: [
      { text:'[A] „Vieš o LAZARUS protokole?"',     next:'loc_miki_lucia_lazarus' },
      { text:'[B] „Kedy presne si to videla?"',     next:'loc_miki_lucia_kedy' },
      { text:'[C] „Nahlásila si to?"',              next:'loc_miki_lucia_nahlasila' },
    ]
  },

  loc_miki_lucia_zakaznik: {
    name: 'Miki Bar // Lucia — Zákazník',
    art: '👤',
    text: [
      '"Zákazník." Premýšľa.',
      '"Nevidela som ho predtým. Ani potom."',
      '"Vysoký. Šedivý. Hovoril bez prízvuku."',
      '"A mal tu —"',
      'Ukazuje za ľavé ucho.',
      '"Jazvu. Operačnú."',
      '"Vtedy som si myslela — implantát pre sluch."',
      '"Teraz si myslím niečo iné."',
      '',
      '<i>// Ten istý muž ako z nemocnice. Koordinátor. //',
    ],
    onEnter: function(){ gainXP(20); S.flags['lucia_jazva']=true; S.flags['koordinator_jazva']=true; addLog('Koordinátor LAZARUS: jazva za uchom. Implantát.','ok'); showNotif('Koordinátor identifikovaný: jazva, sivý, bez prízvuku'); },
    choices: [
      { text:'[A] Ísť do bunkra',                next:'bunker',
        cond:function(){ return hasItem('keycard') && hasItem('spis'); }, condFail:'Potrebuješ keycard + spis.' },
      { text:'[B] „Ďakujem. Toto je kľúčové."',  next:'loc_miki_lucia_dakujem' },
    ]
  },

  loc_miki_cakat: {
    name: 'Miki Bar // Čakanie',
    art: '🍺',
    text: [
      'Sadneš si. Igor pokračuje v utieraní.',
      'Päť minút. Desať.',
      '',
      'Nakoniec položí pohár a sadne si oproti.',
      '"Si tvrdohlavý. To sa mi páči."',
      '"Čo chceš?"',
    ],
    choices: [
      { text:'[A] „Informácie o nočných udalostiach."', next:'loc_miki_noc' },
      { text:'[B] „Čo sa rieši v Prievidzi?"',          next:'loc_miki_riesenia' },
      { text:'[C] Odísť',                               next:'loc_namestie' },
    ]
  },

  loc_miki_detektor: {
    name: 'Miki Bar // EMF Detektor',
    art: '📡',
    text: [
      '"Detektor." Igor sa zdvihne a odíde do zadnej miestnosti.',
      'Počuješ šúchanie, klopanie o steny, prípadne nadávky.',
      '',
      'Vráti sa s krabicou pokrytou prachom.',
      '"Dostal som to pred dvoma rokmi od elektrikára čo tu býval."',
      '"Hovoril, že v niektorých častiach mesta meria prístroj šesťkrát viac ako normálne."',
      '"Potom elektrikár odišiel. Zanechal toto."',
      '',
      'Podá ti detektor.',
      '"Ber. Ak nájdeš čo hľadáš, povedz mi."',
    ],
    onEnter: function(){ addItem('detektor'); gainXP(15); addLog('EMF detektor získaný od Igora.','ok'); },
    choices: [
      { text:'[A] Poďakovať a ísť k veži',   next:'banovce_cesta' },
      { text:'[B] Zostať, pýtať sa ďalej',   next:'loc_miki_lazarus' },
    ]
  },

  loc_miki_drink: {
    name: 'Miki Bar // Drink',
    art: '🥃',
    text: [
      'Igor sa konečne otočí. Pozrie na teba. Pozrie na pult.',
      '"Slivovica alebo voda."',
      '"Nič iné nemáme." — Bar má za sebou pätnásť druhov whiskey.',
      '',
      'Kúpiš slivovicu. Päťdesiat kreditov.',
      'Dáš ju na pult. Igor ju zoberie späť a vypije sám.',
      '',
      '"Dobrá." Sadne si. "Teraz hovor."',
    ],
    onEnter: function(){
      if(S.money>=50){ S.money-=50; S.san=Math.min(100,S.san+8); updateMoneyDisplay(); updateStats(); addLog('Slivovica: -50₿, SAN +8.','ok'); }
      else { addLog('Nemáš dosť peňazí na drink.','warn'); }
    },
    choices: [
      { text:'[A] „Čo sa deje v meste v noci?"',  next:'loc_miki_noc' },
      { text:'[B] „Vieš o LAZARUS?"',             next:'loc_miki_lazarus' },
    ]
  },

  loc_miki_jaskyne: {
    name: 'Miki Bar // Jaskyne Pod Vtáčnikom',
    art: '🕯️',
    text: [
      '"Svetlá pod zemou." Igor si poklepe na stôl.',
      '"Myslel som, že som blázon. Ale mám svedka — Romana zo Squashu."',
      '"Videli sme to istú noc, nezávisle."',
      '',
      '"Modré svetlo. Rytmické pulzy. Nie baterka."',
      '"Baterka nesvieti cez zem."',
      '',
      '"Ak ideš tam — vezmi plynmasku. A niekoho, komu dôveruješ."',
      '"Alebo aspoň niekoho, koho neľutuješ stratiť."',
    ],
    onEnter: function(){ gainXP(12); addLog('Modrá pulzácia v jaskyniach — stopa.','ok'); },
    choices: [
      { text:'[A] Ísť do jaskýň', next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ aspoň baterku.' },
      { text:'[B] Ísť do Squashu ku Romanovi', next:'loc_squash' },
    ]
  },

  loc_miki_lazarus: {
    name: 'Miki Bar // LAZARUS',
    art: '☠️',
    text: [
      'Igor vstane. Otočí rádio hlasnejšie.',
      'Keď hovorí, robí to so sklonenou hlavou k stolu.',
      '',
      '"LAZARUS. Áno. Počul som to slovo dvakrát."',
      '"Raz od opilého úradníka, čo tu raz spal pri stole."',
      '"Druhý raz — od muža, čo ma prišiel varovať, aby som zabudol na to, čo som počul."',
      '',
      '"Ten muž mal červené oči."',
      '"Nie metaforu. Naozaj červené."',
      '',
      '"Odporúčam ti: nájdi Druida. On vie viac ako ja."',
      '"A ak ideš do jaskýň — nevracaj sa sám."',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-8); updateStats(); gainXP(20); addLog('SAN -8. Červené oči — reptiliani.','warn'); activateOp('op-druid'); },
    choices: [
      { text:'[A] „Kde nájdem Druida?"',          next:'posta' },
      { text:'[B] „Červené oči — čo si myslíš?', next:'loc_miki_reptil' },
      { text:'[C] Odísť',                         next:'start' },
    ]
  },

  loc_miki_noc: {
    name: 'Miki Bar // Nočné Udalosti',
    art: '🌙',
    text: [
      '"Noc?" Igor si dá lokol. "V noci sa tu deje veľa."',
      '"Každý štvrtok prichádza dodávka bez loga. Parkuje pri Jantare."',
      '"Neviem čo vykladá. Viem, že Viktor — majiteľ Jantara — ráno vyzerá inak."',
      '"Ako keby niečo dostal. Alebo niečo stratil."',
      '',
      '"A pri Vtáčniku vidím svetlá. Dolu, nie hore."',
      '"Pod zemou niekto svieti."',
      '',
      '<i>// Stopa: štvrtková dodávka pri Jantare //',
    ],
    onEnter: function(){ gainXP(15); S.flags['dodavka_hint']=true; addLog('Stopa: dodávka pri Jantare.','ok'); },
    choices: [
      { text:'[A] „Viktor z Jantara — čo o ňom vieš?"', next:'loc_miki_viktor' },
      { text:'[B] „Svetlá pod Vtáčnikom — jaskyne?"',   next:'loc_miki_jaskyne' },
      { text:'[C] „LAZARUS — poznáš to slovo?"',        next:'loc_miki_lazarus' },
    ]
  },

  loc_miki_otvor: {
    name: 'Miki Bar // Marek Ťa Poslal',
    art: '🗝️',
    text: [
      'Igor sa zastaví. Pomaly sa otočí.',
      '"Marek." Nie otázka. Konštatovanie.',
      '',
      'Odloží pohár. Zamkne dvere baru kľúčom, čo nosí na krku.',
      '',
      '"Sadni."',
      'Atmosféra sa zmení — z ľahostajnej na serióznu.',
      '"Ak ťa Marek posiela, je to vážne. Čo potrebuješ vedieť?"',
    ],
    onEnter: function(){ gainXP(12); addLog('Miki ti dôveruje. Prístup k informáciám.','ok'); },
    choices: [
      { text:'[A] „Čo vieš o LAZARUS protokole?"', next:'loc_miki_lazarus' },
      { text:'[B] „Kto sú ľudia bez ŠPZ?"',        next:'loc_miki_spz' },
      { text:'[C] „Kde zohnám EMF detektor?"',     next:'loc_miki_detektor' },
    ]
  },

  loc_miki_reptil: {
    name: 'Miki Bar // Červené Oči',
    art: '👁️',
    text: [
      '"Čo si myslím?" Igor si sadne. Pozrie do pohára.',
      '',
      '"Vieš čo je najhoršia vec? Nie to, že mi neveríš."',
      '"Najhoršie je, že ja sám si nie som istý čo som videl."',
      '',
      '"Ten muž bol normálny. Oblečenie. Reč. Gestá."',
      '"Len oči nie."',
      '"A keď odišiel — na zemi zostali dve malé kvapky krvi."',
      '"Nie z rany. Z oka."',
      '',
      'Igor dopije pohár a dá si ďalší.',
      '"Niekedy radšej verím, že som sníval."',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-10); updateStats(); gainXP(15); addLog('SAN -10. Svedectvo o reptiliánovi.','warn'); },
    choices: [
      { text:'[A] Ísť do jaskýň',     next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky nepôjdeš.' },
      { text:'[B] Odísť',            next:'start' },
    ]
  },

  loc_miki_spz: {
    name: 'Miki Bar // Autá Bez ŠPZ',
    art: '🚗',
    text: [
      '"ŠPZ?" Igor sa zasmeje horkosladko.',
      '"Sledoval som ich. Mercedes E trieda — štyri kusy."',
      '"Prichádzajú vždy po 23:00. Parkujú pri starej textilke."',
      '"Cez deň ich nie je. V noci vždy."',
      '',
      '"Raz som sa priblížil. Vracal som sa z baru, bolo mi to jedno."',
      '"Šofér sa pozrel na mňa. Len sa pozrel."',
      '"Nepovedal nič. Len sa pozrel."',
      '"Prišiel som domov a vomitoval som tri hodiny."',
      '',
      '"Bez dôvodu. Bez alkoholu. Len po tom pohľade."',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-7); updateStats(); gainXP(12); addLog('SAN -7. Autá bez ŠPZ — stopa.','warn'); S.flags['spz_auta']=true; },
    choices: [
      { text:'[A] Vypytovať sa ďalej',    next:'loc_miki_lazarus' },
      { text:'[B] Ísť do Jantara',        next:'loc_jantar' },
      { text:'[C] Odísť na operáciu',    next:'start' },
    ]
  },

  loc_miki_viktor: {
    name: 'Miki Bar // Viktor Neon',
    art: '👤',
    text: [
      '"Viktor." Igor sa zamyslí. Nepríjemne dlho.',
      '"Prišiel sem pred troma rokmi. Z Bratislavy, hovoril."',
      '"Jantar dal do poriadku za dva mesiace. Hotovosťou."',
      '',
      '"Zákazníci, čo k nemu chodia — nie sú odtiaľto."',
      '"Prichádza neskoro, odchádza včas. Nikdy netriezvy."',
      '"To pri majiteľovi nočného klubu hovorí veľa."',
      '',
      '"Ak ideš do Jantara, nerob hlúposti. A nepij nič, čo si sám neobjednal."',
    ],
    onEnter: function(){ gainXP(10); S.flags['viktor_warn']=true; },
    choices: [
      { text:'[A] Ísť do Jantara',  next:'loc_jantar' },
      { text:'[B] Zostať, pýtať sa',next:'loc_miki_lazarus' },
    ]
  },

  loc_jantar_brat: {
    name: 'Jantar // Bratislava',
    art: '🏙️',
    text: [
      '"Bratislava." Viktor sa trochu uvoľní. Ako keby tá otázka bola bezpečná.',
      '"Áno. Päť rokov. Predtým inde."',
      '"Prievidza je... tichšia. Ľudia tu nevedia čo sa deje pred ich nosom."',
      '"To je buď výhoda alebo nevýhoda. Záleží pre koho."',
      '',
      '"Prečo sa pýtaš? Chceš si otvoriť bar?"',
      'Malý úsmev. Prvý raz.',
      '"Radím ti — nie. Nie tu. Nie teraz."',
    ],
    onEnter: function(){ gainXP(8); },
    choices: [
      { text:'[A] „Prečo nie teraz?"',              next:'loc_jantar_noc' },
      { text:'[B] Priamo: „LAZARUS — poznáš?"',     next:'loc_jantar_konfrontacia' },
    ]
  },

  loc_jantar_disk: {
    name: 'Jantar // Kovový Disk',
    art: '💿',
    text: [
      'Disk je veľký ako minca. Na povrchu gravíra — symbol, čo si nikdy predtým nevidel.',
      'Nie runy. Nie logotyp. Niečo organické, ako keby nakreslené rastom.',
      '',
      'Keď ho stlačíš, krátko sa zahreje.',
      '',
      'Igor mal pravdu — Viktor tu niečo organizuje.',
      '<i>// Získal si Rezonančný Disk. Questový predmet. //',
    ],
    onEnter: function(){ addItem('keycard'); gainXP(20); addLog('Disk získaný — pripomína keycard OMEGA.','ok'); showNotif('Predmet: Rezonančný Disk (≈ Keycard OMEGA)'); },
    choices: [
      { text:'[A] Konfrontovať Viktora',         next:'loc_jantar_konfrontacia' },
      { text:'[B] Odísť diskrétne',              next:'start' },
    ]
  },

  loc_jantar_dodavka: {
    name: 'Jantar // Dodávka',
    art: '🚚',
    text: [
      'Viktor sa neusmeje.',
      'Pohár mu stuhne v ruke.',
      '',
      '"Zásobovacie vozidlo. Nápoje, ľad, servisný materiál."',
      '"Štandardná logistika pre prevádzku tejto veľkosti."',
      '',
      'Pauza. Príliš dlhá.',
      '"Odkiaľ vieš o dodávke?"',
      '',
      'Oči sa mu zúžia. Na moment — naozaj len na moment — reflexy svetiel v nich vyzerajú inak.',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-8); updateStats(); gainXP(15); },
    choices: [
      { text:'[A] Konfrontovať ho naplno: „LAZARUS."', next:'loc_jantar_konfrontacia' },
      { text:'[B] Cúvnuť: „Len som bol zvedavý."',    next:'loc_jantar_unik' },
    ]
  },

  loc_jantar_konfrontacia: {
    name: 'Jantar // Konfrontácia',
    art: '⚡',
    text: [
      '"LAZARUS."',
      '',
      'Viktor odloží pohár. Pomaly. Každý pohyb kontrolovaný.',
      '"Toto slovo tu znie prvýkrát za dlhý čas."',
      '',
      '"Kto si?"',
      '"Čo chceš?"',
      '"Prečo by som ti mal povedať čokoľvek?"',
      '',
      'Traja ľudia pri iných stoloch sa nenápadne otočia.',
      'Nečakajú na signál. Sú tam.',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-12); S.hp=Math.max(0,S.hp-10); updateStats(); gainXP(25); addLog('HP -10, SAN -12. Konfrontácia s Viktorom.','warn'); },
    choices: [
      { text:'[A] „Mám dôkazy. Reptilí DNA."',     next:'loc_jantar_unik',
        cond:function(){ return hasItem('reptiz'); }, condFail:'Nemáš dôkazy na vyjednávanie.' },
      { text:'[B] Utekáš smerom k východu',        next:'loc_jantar_unik' },
      { text:'[C] Bojuješ',                        next:'loc_jantar_boj' },
    ]
  },

  loc_jantar_noc: {
    name: 'Jantar // Nočný Program',
    art: '🌙',
    text: [
      '"Noc je na oddych," hovorí Viktor. "Alebo na prácu. Záleží od človeka."',
      '',
      '"Organizujem súkromné večery. Pre klientov, ktorých nevyberáme náhodne."',
      '"Záujmy, kontakty, vzájomná dôvera."',
      '',
      '"Ty si tu prvýkrát." Nie otázka.',
      '"Čo ťa sem priviedlo — hudba? Alebo si hľadáš kontakt?"',
      '',
      'Za jeho chrbtom sa otvorí dvierka v stene a rýchlo sa zavrú.',
      'Stihneš zahliadnuť: schodisko dolu.',
    ],
    onEnter: function(){ gainXP(10); S.flags['jantar_schodisko']=true; },
    choices: [
      { text:'[A] „Hľadám informácie o LAZARUS."', next:'loc_jantar_konfrontacia' },
      { text:'[B] Sledovať dvierka v stene',        next:'loc_jantar_zadne' },
      { text:'[C] Odísť',                          next:'loc_namestie' },
    ]
  },

  loc_jantar_pocuvat: {
    name: 'Jantar // Odpočúvanie',
    art: '👂',
    text: [
      'Miešaš sa do davu. Pohár v ruke, oči hore.',
      '',
      'Fragment rozhovoru: "...aktivácia sa posúva na štvrtú ráno..."',
      'Iný hlas: "...frekvencia musí byť presná, inak efekt zlyhá..."',
      '',
      'Tretia žena, sama pri stole, si zapisuje čosi do mobilu.',
      'Keď ťa zbadá, rýchlo vstane a odchádza.',
      'Na stole zostane pohár a... malý kovový disk.',
    ],
    onEnter: function(){ gainXP(18); addLog('Odpočúval si Jantar. Stopa: aktivácia o 04:00.','ok'); S.flags['cas_aktivacie']=true; },
    choices: [
      { text:'[A] Zobrať kovový disk',           next:'loc_jantar_disk' },
      { text:'[B] Ísť za Viktorom',              next:'loc_jantar_viktor' },
    ]
  },

  loc_namestie_deje: {
    name: 'Námestie // Rozhovor — Udalosti',
    art: '🏛️',
    text: [
      '"Deje?" Marek sa krátko zasmeje — bez humoru.',
      '"Traja ľudia zmizli za posledný týždeň. Polícia hovorí — sťahovali sa."',
      '"Sťahovali sa," zopakuje, akoby slová samy sebe neverili.',
      '',
      '"Jedno viem: tí čo zmizli, všetci bývali pri Vtáčniku."',
      '"A všetci mali zvedavé otázky na zasadnutiach mestskej rady."',
      '',
      'Pozrie na teba dlhšie ako je nutné.',
      '"Dávaj si pozor na zvedavosť."',
    ],
    onEnter: function(){ gainXP(8); addLog('Informácie od Mareka. XP +8.', 'ok'); },
    choices: [
      { text:'[A] „Kto za tým stojí?"',                next:'loc_namestie_moc' },
      { text:'[B] „Vtáčnik — čo vieš o jaskyniach?"', next:'loc_namestie_jaskyne' },
      { text:'[C] Odísť',                              next:'loc_namestie' },
    ]
  },

  loc_namestie_jaskyne: {
    name: 'Námestie // Jaskyne — Varovanie',
    art: '🦇',
    text: [
      '"Jaskyne?" Marek sa zastaví.',
      '"Môj brat tam chodil ako mladý. Speleológia, hovoril."',
      '"Pred rokom prestal. Keď som sa pýtal prečo —"',
      '"— povedal, že v jednej chodbe je zvuk, čo nie je z tohto sveta."',
      '"A že niektoré steny vyzerajú... inak. Ako keby tam niečo žilo."',
      '',
      '"Neopýtaj sa ho na to druhýkrát. Len sa pozrel na mňa a odišiel."',
      '',
      '<i>// Mentálna mapa jaskýň — vieš, že stredný koridor vedie hlbšie. //',
    ],
    onEnter: function(){ gainXP(8); S.flags['jaskyne_hint']=true; },
    choices: [
      { text:'[A] Ísť do jaskýň (potrebuješ baterku)', next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky sa nevrátiš.' },
      { text:'[B] Zostať a pýtať sa ďalej',           next:'loc_namestie_moc' },
    ]
  },

  loc_namestie_lazarus: {
    name: 'Námestie // LAZARUS — Reakcia',
    art: '⚠️',
    text: [
      'Mareka akoby udrel elektrický prúd. Noviny mu vypadnú z kabáta.',
      '',
      '"Kde si to počul?" Hlas kontrolovaný, ale ruky nie.',
      '',
      '"Toto slovo nehovor tu. Nie na námestí."',
      'Zdvihne noviny. Schová ich znova.',
      '',
      '"Choď za Igorom do Miki baru. On ti povie viac ako ja."',
      '"Ale najprv mu povedz, že ťa posiela Marek. Bez toho ani neotvorí ústa."',
      '',
      '<i>// Získal si kontaktný kód: „Od Mareka." //',
    ],
    onEnter: function(){ S.flags['marek_kod']=true; gainXP(15); addLog('Kontaktný kód získaný.','ok'); showNotif('Kód: „Od Mareka" — použi v Miki bare'); },
    choices: [
      { text:'[A] Ísť do Miki baru',  next:'loc_miki' },
      { text:'[B] Odísť na operáciu', next:'start' },
    ]
  },

  loc_namestie_moc: {
    name: 'Námestie // Rozhovor — Moc',
    art: '🏛️',
    text: [
      'Marek sa rozhliadne. Námestie je prázdne — no aj tak zníži hlas.',
      '',
      '"Oficiálne? Primátor Blaho. Mestské zastupiteľstvo."',
      '"Neoficiálne?" Pauza. "Ľudia, čo nikdy neboli zvolení a nikdy neodstúpia."',
      '',
      '"Vidíš tamten dom na rohu? Pred mesiacom tam bývala rodina."',
      '"Dnes tam parkujú čierne autá. Bez ŠPZ."',
      '',
      '"Niekedy si myslím, že ti poviem príliš veľa."',
      '"A potom si pomyslím — čo by mi to pomohlo, keby som mlčal."',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-5); updateStats(); addLog('SAN -5. Znepokojivé informácie.','warn'); gainXP(10); },
    choices: [
      { text:'[A] „Čo vieš o LAZARUS protokole?"',  next:'loc_namestie_lazarus' },
      { text:'[B] Poďakovať a odísť',               next:'start' },
      { text:'[C] Ísť do Miki baru',                next:'loc_miki' },
    ]
  },

  loc_squash_fri: {
    name: 'Squash // FRI',
    art: '🎓',
    text: [
      '"FRI." Roman sa nadýchne.',
      '"Dr. Oravec tam pracuje — to vie každý. Čo nevie každý:"',
      '"má laboratórium na suteréne. Nie na fakulte. Pod ňou."',
      '"Povolenie? Neoficiálne. Peniaze — zo súkromného grantu."',
      '"Skontroloval som grantovú databázu. Neexistuje."',
      '',
      '"Robí so signálmi. Frekvenciami. Rezonanciou."',
      '"A chodí do práce v noci, nie cez deň."',
    ],
    onEnter: function(){ gainXP(15); S.flags['fri_lab']=true; addLog('Stopa: FRI suterénne laboratórium.','ok'); },
    choices: [
      { text:'[A] Ísť na FRI',              next:'loc_fri' },
      { text:'[B] Ísť do jaskýň',           next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Potrebuješ baterku.' },
    ]
  },

  loc_squash_info: {
    name: 'Squash // Informácie',
    art: '📰',
    text: [
      '"Informácie." Roman zloží noviny.',
      '"Záleží čo hľadáš. Hovorím o udalostiach — nie o špekuláciách."',
      '"Fakty: tri záhadné zmiznutia za mesiac. Polícia ich uzavrela za 48 hodín."',
      '"Fakt: pri FRI pracujú ľudia, čo nie sú na zozname zamestnancov."',
      '"Fakt: v utorok ráno bol Vtáčnik obkľúčený — bez verejného oznamu — na dve hodiny."',
      '',
      '"Špekulácie si nechávam pre seba."',
      '"Ale fakty hovoria dosť, nie?"',
    ],
    onEnter: function(){ gainXP(15); addLog('Fakty od Romana.','ok'); },
    choices: [
      { text:'[A] „FRI — vieš viac?"',              next:'loc_squash_fri' },
      { text:'[B] „Vtáčnik — čo sa tam stalo?"',    next:'loc_squash_vtacnik' },
      { text:'[C] „Zmiznutí ľudia — ich mená?"',    next:'loc_squash_zmiznuty' },
    ]
  },

  loc_squash_jest: {
    name: 'Squash // Jedlo',
    art: '🥣',
    text: [
      'Roman zavolá čašníčku. Bez menu. Vie čo objednáš.',
      '"Kapustnica a chlieb. Najlepšia vec na myseľ."',
      '',
      '"V tejto práci," — a je jasné, že vie aká práca —',
      '"sa ľudia zabudnú najesť. Potom robia chyby."',
      '',
      'Jedlý v tichu.',
      '"Čo ťa sem priviedlo? Informácie alebo len hlad?"',
    ],
    onEnter: function(){ S.hp=Math.min(100,S.hp+15); S.san=Math.min(100,S.san+10); updateStats(); addLog('HP +15, SAN +10. Najedol si sa.','ok'); gainXP(5); },
    choices: [
      { text:'[A] „Oboje. Najprv informácie."', next:'loc_squash_info' },
      { text:'[B] Len jesť a odísť',            next:'start' },
    ]
  },

  loc_squash_vtacnik: {
    name: 'Squash // Vtáčnik',
    art: '🌄',
    text: [
      '"Vtáčnik." Roman si poklepe na stôl.',
      '"Igor a ja sme videli svetlá. Spomínal ti to?"',
      '"Modrá pulzácia. Každú noc medzi jednou a štvrtou."',
      '',
      '"Išiel som tam raz cez deň. Vstup do jaskýň — bol uzavretý."',
      '"Nie reťazou. Kovovou doskou, zavarenou do skaly."',
      '"Nová. Lesklá. Pritom tú jaskyňu som pred piatimi rokmi prechádzal voľne."',
      '',
      '"Niekto tam niečo zavaroval. Alebo v tom niečo."',
    ],
    onEnter: function(){ gainXP(15); addLog('Stopa: uzavretá jaskyňa pod Vtáčnikom.','ok'); S.flags['jaskyňa_uzavrena']=true; },
    choices: [
      { text:'[A] Ísť do jaskýň',       next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky nepôjdeš.' },
      { text:'[B] Pýtať sa ďalej',      next:'loc_squash_fri' },
    ]
  },

  loc_squash_zmiznuty: {
    name: 'Squash // Zmiznutí',
    art: '👤',
    text: [
      '"Mená?" Roman colí pohár.',
      '"Jana Krížová — archivárka na mestskom úrade."',
      '"Tibor Mach — elektrikár, pracoval na Vtáčniku."',
      '"A Ľuboš Varga — novinár z lokálnych novín."',
      '',
      '"Všetci traja mali jedno spoločné."',
      '"Každý z nich kontaktoval niekoho — nie políciu — o niečom čo videli."',
      '"A každý zmizol do 48 hodín od toho kontaktu."',
      '',
      '"Koho kontaktovali?" Ticho. "To neviem."',
      '"Ale som rád, že sa pýtaš ty, a nie oni mňa."',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-8); updateStats(); gainXP(18); addLog('SAN -8. Vzorec miznutia.','warn'); },
    choices: [
      { text:'[A] Ísť do jaskýň',          next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky nepôjdeš.' },
      { text:'[B] Ísť na operáciu',        next:'start' },
    ]
  },

  loc_stanica_delta: {
    name: 'Stanica // Agent Delta',
    art: '⚠️',
    text: [
      '"Agent Delta?" Dušan si pozrie ruky.',
      '"Neviem. Naozaj neviem."',
      '"Ale — keď som dostal ten papier —"',
      '"— bol som na nástupišti. Sám."',
      '"A za päť minút zavolal niekto na stanicu."',
      '"Na pevnú linku. Pýtal sa: \'Dostal ste balík?\'"',
      '"Keď som povedal áno, zavesil."',
      '"Hlas — bez prízvuku. Unavený."',
      '"Hlas niekoho, kto robí niečo dlho a vie, že to musí skončiť."',
      '',
      '<i>// Agent Delta možno sám spolupracuje na zastavení LAZARUS. //',
    ],
    onEnter: function(){ gainXP(20); S.flags['delta_spojenec']=true; addLog('Agent Delta možno spojenec — zaslal zoznam.','ok'); },
    choices: [
      { text:'[A] Ísť za Druidom',                    next:'posta' },
      { text:'[B] Ísť do Bánoviec',                   next:'banovce_cesta' },
    ]
  },

  loc_stanica_dusal_meno: {
    name: 'Stanica // Dušan — Jeho Meno',
    art: '😰',
    text: [
      'Dlhé ticho.',
      '"Nie." Hlasnejšie ako chcel.',
      '"Nie som na tom zozname."',
      '"Ešte."',
      '',
      '"Ale viem, že kto dostane takýto papier —"',
      '"— je buď nasledujúci na rade."',
      '"Alebo niekto chce, aby si o tom vedel."',
      '"Neviem ktoré je horšie."',
      '',
      'Pozrie von oknom na prázdne nástupište.',
      '"Ráno dám výpoveď. Presťahujem sa k bratovi do Trenčína."',
      '"Dnes v noci — zostávam tu."',
      '"Čo mám robiť — odísť? Kto by dal ráno semafór?"',
    ],
    onEnter: function(){ gainXP(12); S.san=Math.max(0,S.san-5); updateStats(); },
    choices: [
      { text:'[A] „Môžem vidieť zoznam?"',  next:'loc_stanica_zoznam_ukaz' },
      { text:'[B] „Buď opatrný, Dušan."',  next:'loc_stanica_autobus' },
    ]
  },

  loc_fri_sledovat: {
    name: 'FRI // Sledovanie',
    art: '🔭',
    text: [
      'Schovávam sa za auto. Pozorujem.',
      '',
      'Oravec pracuje. Monitory. Konzola. Ruky sa pohybujú rýchlo.',
      '',
      'O 02:17 vychádza von — fajčí, pozerá na oblohu.',
      'Mobil. Hovorí — šepká. Len slabiky:',
      '"...uzol sedem... frekvencia čistá... áno, o štvrtej..."',
      '',
      'Odhodí cigaretu a ide späť dnu.',
    ],
    onEnter: function(){ gainXP(15); S.flags['fri_cas']=true; addLog('Stopa: uzol 7, aktivácia o 04:00.','ok'); },
    choices: [
      { text:'[A] Vojsť cez okno suterénu', next:'loc_fri_suteren' },
      { text:'[B] Ísť priamo za Druidom',   next:'posta' },
    ]
  },

  loc_domov_odpocinok: {
    name: 'Domov // Odpočinok',
    art: '😴',
    text: [
      'Sadneš si. Zatvoríš oči.',
      '',
      'Eva ťa nepúšta spať — ale nechá ťa ticho.',
      '',
      'Pol hodiny. Dostatok na to, aby hlava fungovala.',
      '"Vstávaj," hovorí nakoniec. "Ešte nie je deň."',
    ],
    onEnter: function(){ S.hp=Math.min(100,S.hp+20); S.san=Math.min(100,S.san+15); updateStats(); addLog('HP +20, SAN +15. Odpočinul si.','ok'); gainXP(5); },
    choices: [
      { text:'[A] Ísť späť na operáciu', next:'start' },
      { text:'[B] Porozprávať sa s Evou', next:'loc_domov_rozpravat' },
    ]
  },

  loc_domov_pomoc: {
    name: 'Domov // Eva Pomáha',
    art: '🤝',
    text: [
      '"Pomôcť." Eva vstane.',
      '"Celé roky som čakala, že sa niekto opýta."',
      '"Áno. Pomôžem."',
      '',
      'Prinesie krabičku spod postele.',
      '"Otcov denník. Od posledného roka práce na Vtáčniku."',
      '"Nikdy som ho nevedela dočítať. Ale ty áno."',
      '',
      'Denník obsahuje mapy, frekvencie, pozorovania.',
      '<b>A koordináty bunkra — z roku 2014.</b>',
      '<i>// Spis OMEGA — v inom formáte, ale stále platný. //',
    ],
    onEnter: function(){ addItem('spis'); gainXP(25); addLog('Evino spis — koordináty bunkra.','ok'); activateOp('op-lazarus'); showNotif('Eva ti dala: otcov denník = Spis OMEGA'); },
    choices: [
      { text:'[A] Ísť do bunkra',    next:'bunker',
        cond:function(){ return hasItem('keycard'); }, condFail:'Potrebuješ keycard.' },
      { text:'[B] Ísť do jaskýň',    next:'jaskyne_vstup',
        cond:function(){ return hasItem('baterka'); }, condFail:'Bez baterky nepôjdeš.' },
    ]
  },

  loc_domov_rozpravat: {
    name: 'Domov // Eva — Rozhovor',
    art: '🕯️',
    text: [
      'Porozprávaš. Ona počúva.',
      '',
      'Keď skončíš, dlho mlčí.',
      '"LAZARUS." Výdychne.',
      '"Vedela som, že to má meno."',
      '"Môj otec pracoval pri Vtáčniku. Údržba. Pred desiatimi rokmi."',
      '"Rok pred tým ako zomrel — hovoril o signáloch."',
      '"O zvuku čo nik iný nepočul. Len on."',
      '"Hovoril, že mu niečo vŕtalo do hlavy."',
      '"Lekári povedali — stres."',
      '"Zomrel na mozgovú príhodu o pol roka neskôr."',
      '"Mal päťdesiatjeden."',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-10); updateStats(); gainXP(20); addLog('SAN -10. Evino svedectvo o otcovi.','warn'); S.flags['eva_otec']=true; },
    choices: [
      { text:'[A] „Pomôžeš mi to zastaviť?"',    next:'loc_domov_pomoc' },
      { text:'[B] Ísť na operáciu s novými info', next:'start' },
    ]
  },

}; // ← KONIEC SCENES databázy
