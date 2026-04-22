'use strict';

/* ════════════════════════════════════════════════════════════════════
   DATA: Fotografie scén a databáza scén (SCENES)
   Závisí na: systems/state.js (S), systems/renderer.js (Renderer),
              ui/engine.js (addItem, gainXP, addLog, gameOver, showNotif, activateOp, hasItem)
              systems/hunger.js (HungerSystem)
════════════════════════════════════════════════════════════════════ */

var SCENE_PHOTOS = {
  'start':           { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Prievidza_centrum.jpg/800px-Prievidza_centrum.jpg',   badge:'PRIEVIDZA // CENTRUM // 03:47' },
  'centrum_noc':     { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Prievidza_centrum.jpg/800px-Prievidza_centrum.jpg',   badge:'PRIEVIDZA // NOC' },
  'posta':           { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Prievidza_po%C5%A1ta.jpg/800px-Prievidza_po%C5%A1ta.jpg', badge:'HLAVNÁ POŠTA // DEAD DROP' },
  'posta_spis':      { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Prievidza_po%C5%A1ta.jpg/800px-Prievidza_po%C5%A1ta.jpg', badge:'POŠTA // SPIS OMEGA' },
  'posta_viac':      { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Prievidza_po%C5%A1ta.jpg/800px-Prievidza_po%C5%A1ta.jpg', badge:'POŠTA // ROZHOVOR' },
  'posta_mapa':      { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Prievidza_po%C5%A1ta.jpg/800px-Prievidza_po%C5%A1ta.jpg', badge:'POŠTA // MAPA JASKÝŇ' },
  'jaskyne_vstup':   { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bojnicka_jaskyna.jpg/800px-Bojnicka_jaskyna.jpg',    badge:'BOJNICKÉ JASKYNE // VSTUP' },
  'jaskyne_hluky':   { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bojnicka_jaskyna.jpg/800px-Bojnicka_jaskyna.jpg',    badge:'JASKYNE // ĽAVÝ KORIDOR' },
  'jaskyne_odpoc':   { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bojnicka_jaskyna.jpg/800px-Bojnicka_jaskyna.jpg',    badge:'JASKYNE // ODPOČÚVANIE' },
  'jaskyne_boj':     { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bojnicka_jaskyna.jpg/800px-Bojnicka_jaskyna.jpg',    badge:'JASKYNE // SÚBOJ' },
  'jaskyne_boj_easy':{ url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bojnicka_jaskyna.jpg/800px-Bojnicka_jaskyna.jpg',    badge:'JASKYNE // RÝCHLY SÚBOJ' },
  'jaskyne_ticho':   { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bojnicka_jaskyna.jpg/800px-Bojnicka_jaskyna.jpg',    badge:'JASKYNE // TICHÝ KORIDOR' },
  'jaskyne_hlbina':  { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bojnicka_jaskyna.jpg/800px-Bojnicka_jaskyna.jpg',    badge:'JASKYNE // HLBINA' },
  'banovce_cesta':   { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bojnice_castle.jpg/800px-Bojnice_castle.jpg',        badge:'BÁNOVCE N/B // PRÍJAZD' },
  'banovce_meranie': { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bojnice_castle.jpg/800px-Bojnice_castle.jpg',        badge:'BÁNOVCE // EMF MERANIE' },
  'banovce_foto':    { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bojnice_castle.jpg/800px-Bojnice_castle.jpg',        badge:'BÁNOVCE // DOKUMENTÁCIA' },
  'banovce_odpoj':   { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bojnice_castle.jpg/800px-Bojnice_castle.jpg',        badge:'BÁNOVCE // SABOTÁŽ VEŽE' },
  'banovce_vlam':    { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bojnice_castle.jpg/800px-Bojnice_castle.jpg',        badge:'BÁNOVCE // ALARM' },
  'bunker':          { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prievidza_aerial.jpg/800px-Prievidza_aerial.jpg',    badge:'OMEGA VAULT // BUNKER LAZARUS' },
  'bunker_dna':      { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prievidza_aerial.jpg/800px-Prievidza_aerial.jpg',    badge:'OMEGA VAULT // KONFRONTÁCIA' },
  'bunker_spis':     { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prievidza_aerial.jpg/800px-Prievidza_aerial.jpg',    badge:'OMEGA VAULT // KONFRONTÁCIA' },
  'bunker_boj':      { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prievidza_aerial.jpg/800px-Prievidza_aerial.jpg',    badge:'OMEGA VAULT // BOJ' },
};

/* ═══════════════════════════════════════════════════════════════════
   SCENES DATABASE  (full story content — unchanged from original)
═══════════════════════════════════════════════════════════════════ */
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
    name: 'Prievidza Hl. Stanica // 23:51',
    art: '🚉',
    text: [
      'Vlak zastaví. Nevieš kedy presne si zaspal — niekde za Zlatými Moravcami.',
      'Zobúdzaš sa na seba v okne: tmavé sklo, tvár ktorú poznáš ale nespoznávaš.',
      'Tri roky Baku. Pred tým Tbilisi. Pred tým niečo čo radšej necháš za hranicou spomienok.',
      '',
      'Dvere sa otvoria. Studený vzduch príde prvý.',
      '',
      'Nástupište je prázdne. Jeden bezpečnostný dron M.E.C. sa pomaly otáča pod stropom,',
      'červené oko mení uhol. A potom ho uvidíš.',
      '',
      '<i>// [ALZABOX] NOVÝ BYT. NOVÝ ŽIVOT. — MAGURA ESTATE CORP. //',
      '',
      'Hologram. Päť metrov. Beztvárá figúra sa pomaly otočí smerom k tebe.',
      'Vieš že ťa nevidí. Aj tak máš pocit, že ťa sleduje.',
      '',
      'Vyjdeš von. Na chodníku je kaluž — dažďová, plytká, naolejovaná z cesty.',
      'Modrobiely hologram sa odráža v nej, roztrhaný na vlnách od tvojich krokov. Ani tu mu neunikneš.',
      '',
      '<i>// [TRAS] Prievidza. Pamätáš ju inak. Menšiu. Teplejšiu. Mesto kde ľudia ešte vedeli mená susedov.',
      '<i>// Čo sa stalo s tým mestom? Alebo — čo sa stalo s tebou? //',
      '',
      '<i>// [VNEM] Dron zaznamenal tvoj príchod. Nie aktívne sledovanie — pasívna registrácia.',
      '<i>// Niekde v databáze M.E.C. sa práve objavilo tvoje meno, čas, miesto. Niekto to môže nájsť. //',
      '',
      '<i>// [LOGIKA] Alzabox hologramy sú sieťové, nie lokálne. Centrálne riadené. Čo znamená že Magura',
      '<i>// vie presne kto stojí pred každým z nich. Pasívne biometrické skenovanie. Samozrejme. //',
      '',
      '<i>// ▼ HLAD −5 · 📍 Prievidza odomknutá //',
    ],
    onEnter: function(){
      S.hunger = Math.max(0, S.hunger - 5);
      S.flags['prievidza_unlocked'] = true;
      S.flags['mec_scan_1'] = true;
      addLog('MEC dron: pasívna registrácia príchodu na stanici.', 'warn');
      Renderer.updateStats();
    },
    choices: [
      { text: 'Ísť cez priemyselnú štvrť — skratka',  next: 'sc_002_stokari' },
      { text: 'Ísť hlavnou cestou do centra',          next: 'centrum_noc' },
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
      '<i>// [VNEM] Traja. Hoodie s kapucňou — stará, vyblednutá, ale na ramene jedného svietiaci nášivkový patch:',
      '<i>// lebka z obvodu, modré LED. Lacný augment na predlaktí toho v strede — subkutánny indikátor sily,',
      '<i>// Gentech B2. Červený. Stokári. Nestoja tu náhodou, bránia vchod do skladu ktorý niekto vlastní. //',
      '',
      '<i>// [TRAS] Cítiš uhlie. Nie skutočné — pamäť miesta. Dekády ľudí čo chodili touto cestou na šichtu.',
      '<i>// A potom nič. A potom títo traja. //',
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
      { text: '"Prechádzam." [neutrálne]',
        next: 'sc_002_prechod' },
      { text: '"Môj problém." [REP Stokári −1]',
        next: 'sc_002_moj' },
      { text: '"Poznáš Jantar?" [REP Stokári +1]',
        next: 'sc_002_jantar', xp: 10 },
      { text: '(Zastav sa, pozri na augment, nič nehovor) — VNEM [XP +15]',
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
      'Pozrieš na augment. LED bliká — červená, pomalá.',
      'Gentech B2, predávali ich vo výpredaji po roku 2069 keď vyšli lepšie modely.',
      'Indikuje svalovú záťaž. Červená znamená relaxovaný.',
      '',
      'Ferko si všimne že pozeráš. "Čo?"',
      '"Gentech B2. Červená. Nie si napätý." "A?"',
      '"Keby si chcel problém, bola by oranžová."',
      '',
      'Dlhé ticho. Potom — od múra, jeden zo zvyšných — krátky smiech. Ferko cúvne o krok.',
      '"Choď."',
      '',
      '<i>// [HRDOSŤ] Dobre. Čisto. Bez zbytočného. //',
      '<i>// [EMPATIA] Ferko je dvadsaťpäť, možno menej. Robí toto pretože niekto mu platí',
      '<i>// a on potrebuje kredit na nájom v M.E.C. bloku. Nie je to jeho voľba — je to jeho možnosť. //',
      '',
      '<i>// ▲ XP +15 · Stokári — prvý kontakt, neutrálny //',
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
      'Pred vchodom — žiadny Alzabox, ale nad dverami stará neonová ryba, holografická, otvára ústa donekonečna.',
      'Neon bliká — nie chyba elektrickej siete, rytmus. Niekto to tak nastavil.',
      '',
      'Prvá vec ktorú pocítiš je teplo. Každá verejná budova v meste reguluje na sedemnásť stupňov.',
      'Miki bar má dvadsaťdva. Niekto to tu ohrieva schválne.',
      '',
      '<i>// [TRAS] Vzduch chutí po cigaretách, lacnom pive a niečom čo nevieš pomenovať.',
      '<i>// Je to vôňa mesta ktoré sa vzdalo ale ešte o tom nevie. //',
      '',
      'Za barom stojí Lucia. Vlasy má kratšie ako predtým — temno-červené, farbené doma.',
      'Na zápästí tetovanie: obvod, alebo rieka, záleží od uhla.',
      'Keď ťa uvidí, zastaví sa. Len na sekundu.',
      '',
      '"Ty vole."',
      'Nie je to pozdrav. Nie je to nadávka. Je to konštatovanie.',
      '"Tri roky. A prídeš o polnoci, bez správy, bez ničoho, a sadneš si k baru ako keby si bol vonku na cigarete."',
    ],
    onEnter: function(){
      gainXP(10);
      S.flags['miki_navstiveny'] = true;
      addLog('Miki Bar: Lucia — prvý kontakt po 3 rokoch.', 'ok');
    },
    choices: [
      { text: '"Mal som komplikovaný rozvrh." [REP Lucia −1]', next: 'sc_003_lucia_rozvrh' },
      { text: '"Baku ma zdržalo." [neutrálne]',                next: 'sc_003_lucia_baku' },
      { text: '"Vedela si, že sa vrátim." [REP Lucia +1]',    next: 'sc_003_lucia_vedela', xp: 5 },
      { text: '(Nič nehovor. Len si sadni.) [SAN +2]',        next: 'sc_003_lucia_mlcanie', san: 2 },
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
      '<i>// [LOGIKA] Zaujímavé rozlíšenie. Ona naznačuje že tvoj návrat nebol výsledkom rozhodnutia',
      '<i>// ale nevyhnutnosti. Má pravdu? Prečo si sa vlastne vrátil? //',
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
      '<i>// [SAN +2] Ticho má niekedy viac zmyslu ako slová. //',
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
      '"Tri roky som tu za týmto barom počúvala ľudí. Vieš čo som sa naučila?",',
      '"Každý má svoju verziu mesta."',
      '"Starý Miro povie ti, že Prievidza umrela keď zatvorili bane."',
      '"Mladí čo chodia sem v piatok povedia ti, že Prievidza nikdy nežila."',
      '"A Tomáš z M.E.C. — ten čo chodí sem v utorok večer, myslí si že ho nepoznám —',
      ' ten ti povie, že Prievidza je investičná príležitosť."',
      '"Nikto z nich nemá celkom pravdu. A nikto celkom klame."',
      '',
      '"Ty? Čo hovoríš ty?"',
      '"Ja hovorím, že som tu. Čo o mne hovorí viac ako chcem."',
      '',
      '"Ľudia v bytoch M.E.C. majú internet iba cez Bane Corp. infraštruktúru.",',
      '"Každý paket, každá správa, každý hovor ide cez ich servery."',
      '"Môj sused Ján — šesťdesiatdva, chodí hlasovať každé voľby.",',
      '"V marci hlasoval za stranu ktorej nikdy neveril. Bol z toho zmätený.",',
      '"Nechcel som," hovoril. "Ale prišiel som k urne a ruka išla sama."',
      '',
      '<i>// [LOGIKA] 5G infraštruktúra. Bane Corp. siete. Biomodifikácia neurálnych receptorov',
      '<i>// cez mikrovlnné frekvencie je teoreticky možná od roku 2041. Teoreticky. //',
      '<i>// [EMPATIA] Ona ti to hovorí pretože sa bojí. A pretože nemá koho iného kto by ju počúval. //',
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
      '<i>// [SAN +1] Niekedy stačí len byť prítomný. //',
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
      '<i>// [LOGIKA] Cibuľu. O polnoci. V bare. Buď je to metafora, alebo je to presne to čo to je. //',
      '',
      '"Nie hocijakú. Tú starú, z trhoviska. Tá čo predáva Marta — vedľa hodinára, každú stredu.",',
      '"Bane Corp. začali pred rokom pestovať nejaké hybridné veci, geneticky.",',
      '"Cibuľa má byť cibuľa, rozumiete? Nie nejaký korporátny experiment."',
      '',
      '"Trhovisko je zatvorené. Marta odišla.",',
      '"Ale niekde tá cibuľa musí byť. Všetko čo bolo — niekde je."',
      '',
      '<i>// [EMPATIA] Nehovorí o cibuli. Alebo hovorí o cibuli a zároveň o niečom inom. //',
      '<i>// [TRAS] Všetko čo bolo — niekde je. Nie poetická pravda — doslovná. //',
      '',
      '<i>// 📋 Quest: CIBUĽA — Nájdi Martinu cibuľu · ▲ XP +10 //',
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
      '"Bolo nás päť, išli sme od Jantaru domov, asi o druhej.",',
      '"A nad Cigelkou — niečo preletelo. Ticho. Žiadny zvuk.",',
      '"Svetlá, ale nie ako lietadlo. Tri svetlá, trojuholník, pomalé."',
      '"Zastavili sme auto na tej ceste pri Lesoparku.",',
      '"Oproti nám zastavilo auto. Dvaja chlapi. Spýtali sa nás kde je Lesopark."',
      '',
      '<i>// [VNEM] Ruka mu jemne trasie. Nie od alkoholu — ruky opitých sa trasú inak.',
      '<i>// Toto je adrenalín. Spätný adrenalín, hodiny starý. On naozaj niečo videl. //',
      '',
      '<i>// [TRAS] Trojuholníkové svetlá. Ticho. Lesopark. Niečo v tebe — hlboko, pod logikou —',
      '<i>// vie že toto je dôležité. Nevie prečo. Zatiaľ. //',
      '',
      '"Ich auto nemalo poznávaciu značku. Rovnako ako to biele pred barom."',
      'Všetci sa pozrú na dvere. Biele auto je preč.',
      '',
      '<i>// [DAEDALUS — PRÍJEM 01:52] Agent. Vitám ťa späť v operačnej oblasti.',
      '<i>// Incident utorok 02:14 — zaregistrovaný. Klasifikácia: otvorená.',
      '<i>// Neidentifikované vzdušné objekty nad Prievidzou — tri nezávislé zdroje.',
      '<i>// Súvislosť s projektom LAZARUS: pravdepodobná.',
      '<i>// Priorita A: Bánovce nad Bebravou. 5G vysielač, sektor 7.',
      '<i>// Odchod odporúčaný pred svitaním. //',
      '',
      '<i>// 📋 Quest: LAZARUS — Bánovce, Sektor 7 · ▼ HLAD −8 · ▼ SAN −3 //',
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
      '"Tri roky. Kaukaz. Vrátil si sa pretože si musel, nie pretože si chcel.",',
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
      '<i>// [TELO — HP] //',
      '"Telo je nástroj. Nie chrám, nie väzenie. Nástroje sa brúsia, opravujú, skladajú keď ich zanedbáš.",',
      '"Gym na Zagorskej. Terasy pri Bojniciach. Spánok. Jedlo."',
      '<i>// HP max 100. Klesa bojom, hladom, nespánkom. Rastie odpočinkom, jedlom, lekárom. //',
      '',
      '<i>// [MYSEĽ — SANITA] //',
      '"V tomto meste existujú informácie ktoré mozog nevie spracovať bez straty.",',
      '"Čím hlbšie pôjdeš — do tunelov, do sietí, do histórie — tým viac budeš vidieť veci ktoré nie sú pre ľudské oči.",',
      '"Sanita nie je slabosť. Je to zásobník. Keď je prázdny, prestaneš rozlišovať čo je skutočné."',
      '<i>// SAN max 100. Klesa odhaleniami, izoláciou, Mentátom. Rastie rozhovorom, prírodou, záhradou. //',
      '',
      '<i>// [HLAD] //',
      '"Hladný agent je pomalý agent. Hladný agent robí chyby. Základňa má sporák. Použi ho."',
      '<i>// HLAD max 100. Pri 30 a menej: −2 ku každej akcii. Pri 0: strácaš HP každú hodinu. //',
      '',
      '<i>// ▼ SAN −2 (príliš veľa informácií naraz) //',
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
      '"Tunely pod Bojnicami. Sú staré. Staršie ako Bane Corp., staršie ako ja.",',
      '"Teraz — niečo tam je. Nie ľudia. Server farm. Alebo to čo z nej zostalo."',
      '"LAZARUS bol zapnutý v roku 2061. Tam. Pod Bojnicami.",',
      '"Mysleli sme že je to zálohovací systém. Nebol."',
      '',
      '<i>// [LOGIKA] Server farm pod Bojnicami. Rok 2061. Šestnásť rokov.',
      '<i>// Čo vie o systéme ktorý hľadá telo? //',
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
      '<i>// [SAN +3] //',
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
      '"Bol som baník. Potom inžinier. Potom niekto koho M.E.C. nechcel nechať existovať.",',
      '"A potom som prestal byť niekto koho môžu nájsť."',
      '',
      '"Bol som pri tom keď zapli LAZARUS. Rok 2061.",',
      '"Server farm pod Bojnicami. Mysleli sme že je to zálohovací systém. Nebol."',
      '',
      '"Odporúčam aby si sa naučil hackovat.",',
      '"Nie pretože je to najefektívnejšie.",',
      '"Ale pretože LAZARUS žije v sieti a ak ho chceš vidieť, musíš vedieť kde pozerať."',
      '',
      '<i>// [LOGIKA] Druid bol pri zapnutí LAZARU. Rok 2061. Šestnásť rokov. //',
      '<i>// [VÔĽA] Môžeš odísť. Máš dosť informácií. Ale niečo ťa tu drží — zvedavosť.',
      '<i>// A to je možno najnebezpečnejšia vec v tomto meste. //',
      '',
      'Druid vstane. Zbalí mapu. Oheň nechá horieť.',
      'Za ním zostane len plameň v plechovke a hologramový odraz Alzaboxu v kaluži pätnásť metrov ďalej.',
      '',
      '<i>// [ALZABOX] NOVÝ BYT. NOVÝ ŽIVOT. //',
      '<i>// [TRAS] Tri veci v jednom odraze. Ty. Oheň starého muža. Reklama korporácie.',
      '<i>// Toto je mesto. Toto je situácia. Vyber si čo z toho si. //',
      '',
      '<i>// ▲ XP +20 · SAN +3 · Druid — kontakt pridaný · LAZARUS: zapnutý 2061, Bojnice //',
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
      '<i>// Druid. Tvoj kontakt. Čo presne je LAZARUS? //',
    ],
    choices: [
      { text:'[A] Ísť na poštu za Druidom',     next:'posta' },
      { text:'[B] Preskúmať centrum',            next:'centrum_noc' },
      { text:'[C] Ísť do Jantaru',              next:'loc_jantar' },
      { text:'[D] Ísť na FRI',                  next:'loc_fri' },
      { text:'[E] Ísť na Nám. slobody',         next:'loc_namestie' },
    ]
  },

  centrum_noc: {
    name: 'Centrum // Nočné Prievidza',
    art: '🌃',
    text: [
      'Neon Pizzéria a Supermarket sú zamknuté. Ticho.',
      '',
      'Na plote: nový nápis — "PROJEKT 5G = BOJ PROTI SLOBODE".',
      'Vedľa: "LAZARUS NÁS POČUJE. ALOBAL POMÁHA."',
      '',
      'Žena v čiernom stojí pri fontáne a fajčí.',
      '"Nočná smena?" Pohľad na teba. Ostrý. Vyhodnocujúci.',
      '"Alebo nočná akcia?"',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text:'[A] „Čo sa tu deje?"',      next:'centrum_lucia' },
      { text:'[B] Ignorovať — ísť na poštu', next:'posta' },
      { text:'[C] Preskúmať nápisy',       next:'centrum_napisy' },
    ]
  },

  centrum_lucia: {
    name: 'Centrum // Lucia',
    npcName: 'Lucia Vaňová',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '👩',
    text: [
      '"Čo sa deje?" Zasmeje sa. Nie veselo.',
      '"Štandardná Prievidza. Ľudia sa boja, niečo cítia ale nevedia čo."',
      '',
      '"Volám sa Lucia. Novinárka — bola som novinárka."',
      '"Teraz som len... tu."',
      '',
      'Na jej zápästí: jazva. Čerstvá. Chirurgická.',
      '"Záujímavé, nie?" Vidí, že si si všimol. "Dajú ti to bez pytania. Vraj monitoring."',
      '"Vraj dobrovoľné." Zahodí cigaretu.',
      '"Nebolo."',
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
      '"LAZARUS." Pauza.',
      '"Písala som o tom. Pred mesiacom. Redakcia článok zabila."',
      '"Šéfredaktor povedal: nedokázaná konšpirácia."',
      '"Na druhý deň som mala predvolanie k lekárovi. Povinné. Z mesta."',
      '"A keď som sa vrátila — mal som niečo nové na zápästí."',
      '',
      '"LAZARUS nie je projekt. Je to systém."',
      '"Frekvencie, biológia, kontrola." Pozrie na hodinky.',
      '"O štvrtej sa spustí druhá fáza. Vtedy je neskoro."',
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
      '"Doktor Mináč. Klinika pri FRI."',
      '"Ale — on len vykonáva. Príkazy dostáva z FRI."',
      '"Oravec. Pavel Oravec."',
      '',
      '"Viem, že to znie ako konšpirácia."',
      '"Ale konšpirácie majú jeden problém: niekedy sú pravda."',
    ],
    onEnter: function(){ gainXP(10); S.flags['oravec_stopa']=true; addLog('Dr. Oravec na FRI — LAZARUS velenie.','ok'); },
    choices: [
      { text:'[A] Ísť na FRI',         next:'loc_fri' },
      { text:'[B] Ísť za Druidom',     next:'posta' },
    ]
  },

  centrum_lucia_pomoc: {
    name: 'Centrum // Lucia — Spolupraca',
    npcName: 'Lucia Vaňová',
    npcImg: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/lucia.png',
    art: '👩',
    text: [
      'Lucia sa zastaví.',
      '"Zastaviť." Opakuje slovo.',
      '"Vtáčnik. To je miesto. Hlavný uzol."',
      '"Ak ho fyzicky prerušíš — fáza 2 sa nespustí."',
      '"Potrebuješ sa dostať do jaskyne pod ním."',
      '',
      '"Mám toto." Podá ti starú turistickú mapu so zápisom.',
      '"Vstup cez Bojnické jaskyne, stredný koridor. Ale —"',
      '"Potrebuješ baterku. A niekoho kto vie cestu."',
      '"Druid vie cestu. Choď za ním."',
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
      'Väčšina sú klasiky — anarchistické symboly, politické heslá.',
      '',
      'Ale jeden nápis je iný. Čerstvý. Presný.',
      '"LAZARUS NODE 7 = 48.7702°N 18.6196°E"',
      '"VTÁČNIK. SIGMA CORE. NEUTRALIZUJ."',
      '',
      'Pod tým, ceruzkou:',
      '"— A.D."',
      '',
      '<i>// A.D. = Agent Delta? Koordináty sú GPS. Vtáčnik. //',
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
      'Pošta. Zatvoreá. Ale dvierka sú pootvorené.',
      '',
      'Za pultom: starší muž. Čaká.',
      '"Myslel som, že neprídeš." Druid. Tvoj kontakt.',
      '"Máme menej času, ako som čakal."',
      '',
      '"LAZARUS — protokol rezonančnej synchronizácie —"',
      '"— aktivácia o štvrtej ráno. Primárny uzol je Vtáčnik."',
      '"Ak ho nezastavíme, celé mesto bude pod vplyvom do rána."',
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
      '"Čo robí?" Druid si sadne.',
      '"60 GHz milimetrové vlny. Saturácia kyslíka."',
      '"Nie smrť — niečo subtílnejšie. Poddajnosť."',
      '"Biologická poddajnosť. Ako keď ľudia prestanú klásť otázky."',
      '',
      '"Viem, znie to absurdne." Pozrie na teba priamo.',
      '"Ale Oravec mi to potvrdil — pred tým, než zmizol."',
      '"A Lucia Vaňová to cítila na vlastnej koži."',
      '',
      '"Musíme zastaviť uzol 7. Fyzicky — alebo hackingom."',
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
      'Druid rozloží starú mapu.',
      '"Bojnické jaskyne. Tri koridory."',
      '"Ľavý vedie k podzemnej rieke — slepá ulička."',
      '"Pravý — ten je nebezpečný. Strážený."',
      '"Stredný koridor. To je cesta k uzlu 7."',
      '',
      '"Uzol je v hĺbke 40 metrov. Tam je bunker."',
      '"Na bunkri potrebuješ keycard. A — spis OMEGA pre overenie."',
      '"Bez oboch ťa systém odmietne."',
      '',
      '"Baterku máš?" Pozrie na teba.',
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
      '"Spis OMEGA." Druid si prezrie dokumenty.',
      '"Toto je... viac ako som čakal."',
      '"Agent Delta bol dôkladný."',
      '',
      '"S týmto a keycardou môžeš vstúpiť do bunkra."',
      '"Koordinátor bude tam. Musíš ho presvedčiť — alebo zastaviť."',
      '"Ak vírus do systému — LAZARUS sa zablokuje."',
      '"Ale potrebuješ HCK 30 alebo viac."',
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
      '<i>// Spis OMEGA. Toto je dôkaz. //',
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
      'Vstup do jaskyne. Čelová lampa (alebo baterka) na maximum.',
      '',
      'Tma. Dych. Vlhkosť.',
      '',
      'Tri koridory pred tebou.',
      'ĽAVÝ: zvuky vody — podzemná rieka.',
      'STREDNÝ: ticho. Hlboké ticho.',
      'PRAVÝ: vzdialené svetlo. A hlasy.',
      '',
      '<i>// Druid hovoril: stredný koridor. //',
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
      'Zvuky vody zosilňujú. Podzemná rieka.',
      'Krásne. A slepá ulička — rieka blokuje cestu.',
      '',
      'Ale na stene, ceruzkou:',
      '"UZOL 7 → STREDNÝ. NE ĽAV."',
      '"—T.D."',
      '',
      '<i>// T.D. = Tomáš Dravecký? //',
    ],
    onEnter: function(){ gainXP(8); },
    choices: [{ text:'[A] Vrátiť sa a ísť stredným', next:'jaskyne_vstup' }]
  },

  jaskyne_odpoc: {
    name: 'Jaskyne // Pravý Koridor',
    art: '🔦',
    text: [
      'Svetlo. Dvaja strážnici pri kempingovom stolíku.',
      'Nie štandardná bezpečnostná uniforfia — civily. Vyzerajú unavene.',
      '',
      'Jeden z nich ťa zazrie.',
      '"Hej! Kto si?"',
      '',
      'Máš sekundu na rozhodnutie.',
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
    name: 'Jaskyne // Súboj — Pravý Koridor',
    art: '⚔️',
    text: [
      'Prvý útok tvojej strany. Prekvapenie.',
      'HP -15. Ale obaja dole.',
      '',
      'Za nimi: dvierka. Zamknuté.',
      'A na stole: tablet s označením "LAZARUS NET MONITOR".',
      '',
      'Rýchle prezeranie. Reálny čas.',
      'Uzol 7 — online. Countdown: 47 minút.',
      '',
      '<i>// Čas beží. //',
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
      '<i>// Cesta je voľná. Ale autorizácia? //',
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
      '<i>// Kúpil si čas. Teraz — uzol. //',
    ],
    onEnter: function(){ gainXP(30); S.hackStat=Math.min(100,S.hackStat+3); Renderer.updateStats(); S.flags['delay_lazarus']=true; addLog('LAZARUS odložený o 30 min. Hacking +3.','ok'); showNotif('⏱ LAZARUS delay: +30 minút'); },
    choices: [{ text:'[A] Ísť stredným koridorom', next:'jaskyne_stred' }]
  },

  jaskyne_stred: {
    name: 'Jaskyne // Stredný Koridor',
    art: '🕯️',
    text: [
      'Stredný koridor. Ticho. Len tvoje kroky.',
      '',
      'Steny sú mokré. Na zemi: stopy.',
      'Niekoho tu chodí pravidelne.',
      '',
      'Po sto metroch: oceľové dvere.',
      '"OMEGA VAULT — PRÍSTUP LEN S AUTORIZÁCIOU"',
      '',
      'Vedľa: mechanický zámok a elektronický čítač kariet.',
    ],
    choices: [
      { text:'[A] Použiť keycard',  next:'bunker',
        cond:function(){ return hasItem('keycard'); }, condFail:'Nemáš keycard.' },
      { text:'[B] Vrátiť sa',       next:'jaskyne_vstup' },
      { text:'[C] Hacknúť zámok',  next:'jaskyne_hack_zamok',
        cond:function(){ return S.hackStat>=30; }, condFail:'Nedostatočný hacking (30+).' },
    ]
  },

  jaskyne_hack_zamok: {
    name: 'Jaskyne // Hacknutie Zámku',
    art: '🔓',
    text: [
      'Elektronika je stará. AES-128 — ale implementácia slabá.',
      '',
      'Trvá to štyri minúty.',
      'Počuješ kroky za sebou. Rýchlejší.',
      '',
      'Zámok klikne.',
      '',
      '<i>// Prístup udelený. Kroky pribúdajú. //',
    ],
    onEnter: function(){ gainXP(35); S.hackStat=Math.min(100,S.hackStat+5); Renderer.updateStats(); addLog('Hacking +5. Zámok hacknutý.','ok'); },
    choices: [{ text:'[A] Vstúpiť rýchlo', next:'bunker' }]
  },

  jaskyne_ticho: {
    name: 'Jaskyne // Tichý Sektor',
    art: '🌑',
    text: [
      'Chodba sa zužuje. Teplota klesá.',
      '',
      'Na stenách: biele vlákna. Organické.',
      'Rovnaké ako pod Korzom.',
      '',
      'SAN -8.',
      '"Bio-Echo." Pamätáš si Oravca.',
      '"Oni ťa môžu vidieť."',
      '',
      '<i>// Je neskoro na opatrnosť. Pohyb. //',
    ],
    onEnter: function(){ S.san=Math.max(0,S.san-8); Renderer.updateStats(); gainXP(10); addLog('SAN -8. Bio-Echo aktívny.','warn'); },
    choices: [{ text:'[A] Pokračovať', next:'jaskyne_stred' }]
  },

  jaskyne_hlbina: {
    name: 'Jaskyne // Hlbina',
    art: '⬇️',
    text: [
      'Schodisko dolu. Tridsať schodov. Štyridsať.',
      '',
      'Na dne: bunker.',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [{ text:'[A] Vstúpiť do bunkra', next:'bunker',
      cond:function(){ return hasItem('keycard'); }, condFail:'Potrebuješ keycard.' }]
  },

  // ── BUNKER / ZÁVER ─────────────────────────────────────────────
  bunker: {
    name: 'OMEGA VAULT // Bunker LAZARUS',
    art: '🔐',
    text: [
      'Bunker. Kovové steny. Neonové svetlo.',
      '',
      'Servery. Oscilátorypole. A uprostred — terminál.',
      'Na obrazovke: countdown.',
      '"LAZARUS PHASE 2 ACTIVATION: 23:14"',
      '',
      'Pri termináloch: muž v laboratórnom plášti.',
      'Otočí sa.',
      '"Vedel som, že prídeš." Hlas unavený.',
      '"Oravec? Alebo niekto nový?"',
    ],
    onEnter: function(){ gainXP(30); addLog('OMEGA VAULT: terminál aktívny. Koordinátor prítomný.','ok'); },
    choices: [
      { text:'[A] „Som tu to zastaviť."',      next:'bunker_dna' },
      { text:'[B] Hacknúť terminál (HCK 30+)',  next:'bunker_hack',
        cond:function(){ return S.hackStat>=30; }, condFail:'Nedostatočný hacking (30+).' },
      { text:'[C] Zaútočiť (SIL 35+)',          next:'bunker_boj',
        cond:function(){ return S.str>=35; }, condFail:'Nedostatočná sila (SIL 35+).' },
    ]
  },

  bunker_dna: {
    name: 'OMEGA VAULT // Koordinátor',
    art: '🔐',
    text: [
      '"Zastaviť." Koordinátor si sadne.',
      '"Každý kto príde sem povie to isté."',
      '"A potom pochopí prečo to nedá zastaviť."',
      '',
      '"Toto nie je zlo. Toto je riešenie."',
      '"Stabilita. Žiadna panika. Žiadna vojna. Žiadne krízy."',
      '"Len — pokoj."',
      '',
      '"Nechceš pokoj?"',
    ],
    choices: [
      { text:'[A] „Pokoj bez slobody nie je pokoj."',   next:'bunker_spis',
        cond:function(){ return hasItem('spis'); }, condFail:'Potrebuješ Spis OMEGA ako dôkaz.' },
      { text:'[B] Hacknúť kým hovorí (HCK 25+)',       next:'bunker_hack',
        cond:function(){ return S.hackStat>=25; }, condFail:'Hacking 25+.' },
      { text:'[C] Zaútočiť',                           next:'bunker_boj',
        cond:function(){ return S.str>=25; }, condFail:'Sila 25+.' },
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
      '<i>// CEO Zla víťazí. Operácia LAZARUS: NEUTRALIZOVANÁ. //',
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
    ]
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
    text: [
      'Miki bar. Nízke svetlo, hlučná hudba.',
      '',
      'Niekoľko chlapov pri baroch — zvyšky nočnej smeny.',
      '',
      'Barman ťa odmeria.',
      '"Čo budeš?"',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text:'[A] Pýtať sa barmanm',          next:'loc_miki_barman' },
      { text:'[B] Kúpiť fľašu whisky (120₿)', next:'loc_miki_flask' },
      { text:'[C] Odísť',                     next:'start' },
    ]
  },

  loc_miki_barman: {
    name: 'Miki Bar // Barman',
    npcName: 'Radovan',
    art: '🍺',
    text: [
      '"Počuješ o tých 5G vežiach?" Barman si utriera pohár.',
      '"Hovorí sa že ich stavajú bez povolenia."',
      '"Vtáčnik — starý vysielač — tam dali niečo nové."',
      '"Moji zákazníci hovoria, že od minulého mesiaca —"',
      '"— ľudia sú pokojnejší. Ale inak. Ako keby im zobral niečo."',
      '"Ako keď vypneš emócie."',
    ],
    onEnter: function(){ gainXP(10); S.flags['miki_info']=true; addLog('Miki bar: Vtáčnik + nová veža.','ok'); },
    choices: [
      { text:'[A] Ísť k Vtáčniku',    next:'banovce_cesta' },
      { text:'[B] Ísť na poštu',      next:'posta' },      { text:'[C] Odísť',                     next:'start' },
    ]
  },

  loc_miki_flask: {
    name: 'Miki Bar // Whisky',
    art: '🥃',
    text: [
      '"Jedna fľaša. 120 kreditov."',
      'Radovan podá fľašu whisky.',
      '"Na zdravie. A — daj si pozor vonku."',
    ],
    onEnter: function(){ if(S.money>=120){ S.money-=120; addItem('flask'); Renderer.updateMoney(); addLog('Whisky kúpená: -120₿','ok'); } else { addLog('Nedostatok kreditov.','warn'); } },
    choices: [{ text:'[A] Odísť', next:'start' }]
  },

  loc_miki_jedlo: {
    name: 'Miki Bar // Jedlo',
    npcName: 'Radovan',
    art: '🍔',
    text: [
      'Radovan ukáže na tabuľu.',
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
      '"Posledný," hovorí Radovan.',
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
      '"Dedova receptúra," povie Radovan. "Nepýtaj sa čo v tom je."',
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
      '"Najlepší kebab na severnom Slovensku," tvrdí Radovan.',
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
      '<i>// Zadarmo jedlo? Vždy vítané. //',
    ],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text:'[A] Zobrať zvyšky (Hlad -35, HP +5)',   next:'loc_squash_jedlo' },
      { text:'[B] Odísť',                              next:'start' },
    ]
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
    ]
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
    ]
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
      '<i>// Kofein: SAN +8, Hlad -10. Ale hlad trochu ukojí. //',
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
      '<i>// Implantát. LAZARUS terén. //',
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
      '<i>// Zoznam obetí LAZARUS — vopred plánovaný. //',
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
      '<i>// Si ty Agent Delta? //',
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
      '<i>// Nie drogy. Injekcia má etiketu: BIO-MARKER SER-7. //',
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
      '<i>// Agent Delta je TU. V čakárni. Alebo bol. //',
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
      '<i>// Kofein + taurín: SAN +10, Hlad -5. Ale spánok bude horší. //',
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
      '<i>// OMEGA-2. Etika pozastavená. Kto to schválil? //',
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
      '<i>// SAN -15. Toto nie je teória. //',
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
      '<i>// Niekedy stačí sebaistota. //',
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
      '<i>// Na bare: menu s nočnými špeciálmi. Jedlo dostupné. //',
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
      '<i>// Viktor = spojka. Alebo strážca. //',
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
      '<i>// Conexia: FRI je súčasť siete LAZARUS. //',
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
      '"Len hotovosť. Bez dokladov."',
    ],
    choices: [
      { text:'[A] Medkit (150₿)',      next:'loc_korzo_buy_medkit' },
      { text:'[B] Baterka (80₿)',      next:'loc_korzo_buy_baterka' },
      { text:'[C] Odísť',             next:'loc_korzo' },
    ]
  },

  loc_korzo_buy_medkit: {
    name: 'Korzo // Kúpa Medkitu',
    art: '🩹',
    text: [ '"150₿." Podá balík.' ],
    onEnter: function(){
      if(S.money>=150){ S.money-=150; addItem('medkit'); Renderer.updateMoney(); addLog('Medkit kúpený: -150₿','ok'); }
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
      '<i>// Organické vlákna — biologická prítomnosť pod mestom. SAN -10 //',
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
      '<i>// SAN -5 od expozície. Toto je uzol 7. //',
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
      '<i>// Toto je server room pre uzol 7. //',
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
      '<i>// Na úplné zastavenie: bunker. //',
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
      '<i>// Dokumentácia = dôkaz pre verejnosť. Ale teraz: zastaviť. //',
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
    text: ['Gym na Zagorskej. Základné zariadenie. Funguje.'],
    onEnter: function(){ gainXP(5); },
    choices: [{ text: 'Ísť trénovať', next: 'gym' }, { text: 'Späť', next: 'start' }]
  },
  loc_terasy: {
    name: 'Terasy pri Bojniciach',
    art: '🌿',
    text: ['Terasy. Ľudia tu chodia kvôli pohybu aj výhľadu. Bojnice dole.', 'SAN +5 za pobyt.'],
    onEnter: function(){ S.san = Math.min(100, S.san + 5); Renderer.updateStats(); gainXP(5); addLog('Terasy: SAN +5.', 'ok'); },
    choices: [{ text: 'Odpočívať', next: 'garden' }, { text: 'Späť', next: 'start' }]
  },
  loc_lesopark: {
    name: 'Lesopark',
    art: '🌲',
    text: ['Lesopark na okraji mesta. Ticho.', 'Kubo spomínal, že tu zastavil v utorok o druhej.'],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: 'Prehľadať okolie', next: 'start' },
      { text: 'Späť do centra',   next: 'start' }
    ]
  },
  loc_biotech: {
    name: 'Bojnická Nemocnica // Biotech',
    art: '🏥',
    text: ['Nemocnica. Verené priestory — štandardné. Za nimi: nové krídlo. Bane Corp. logo.'],
    onEnter: function(){ gainXP(5); S.flags['biotech_videny'] = true; },
    choices: [{ text: 'Vstúpiť', next: 'start' }, { text: 'Späť', next: 'sc_001_prichod' }]
  },
  loc_bojnice: {
    name: 'Bojnický zámok',
    art: '🏰',
    text: ['Bojnický zámok. Turistická atrakcia. Ale za ním — pod ním — niečo iné.', 'Tunely. Zamknuté.'],
    onEnter: function(){ gainXP(5); },
    choices: [
      { text: 'Ísť k nemocnici', next: 'loc_biotech' },
      { text: 'Späť',            next: 'start' }
    ]
  },
  loc_banovce: {
    name: 'Bánovce nad Bebravou // 5G Sektor 7',
    art: '📻',
    text: ['Bánovce. Vysielač. Sektor 7.', '<i>// Toto je cieľ. Daedalus: zdokumentuj vysielač. //'],
    onEnter: function(){ gainXP(10); S.flags['banovce_videny'] = true; activateOp('op-5g'); },
    choices: [{ text: 'Ísť na Vtáčnik', next: 'banovce_cesta' }, { text: 'Späť', next: 'start' }]
  },

}; // ← KONIEC SCENES databázy

/* ═══════════════════════════════════════════════════════════════════
   HERNÝ STAV (S) — Všetky premenné, ukladané cez localStorage
═══════════════════════════════════════════════════════════════════ */
var S = {
  scene:       'start',
  hp:          100,
  san:         100,
  hunger:      100,    // ← NOVÉ: Sýtosť (100 = plný, 0 = hladný)
  xp:          0,
  level:       1,
  money:       150,    // Trochu viac startu pre testovanie jedla
  job:         null,
  jobLevel:    0,
  str:         10,
  flex:        10,
  hackStat:    10,
  inventory:   [],
  fishCaught:  {},
  income:      { job:0, hack:0, fish:0, bonus:0, boats:0 },
  attrRates:   { hp:0, san:0, str:0, flex:0, hack:0 },
  flags:       {},
  visited:     {},
  equipped:    { head:null, body:null, pants:null, weapon:null, special:null, feet:null },
  hqUpgrades:  {},
  hqUnlocked:  {},
  hqPassive:   { hp:0, san:0, hack:0, str:0 },
  garden:      { plots: Array(9).fill(null) },
  gardenIncome:0,
};

/* ═══════════════════════════════════════════════════════════════════
   ╔═══════════════════════════════════════════════════════════╗
   ║           HUNGER SYSTEM v4 — Decision-Based Mechanika     ║
   ║  FYZICKÝ HLAD klesá pri ROZHODNUTIACH (nie čase).         ║
   ║  PSYCHICKÁ SANITA klesá pasívne časom + pri voľbách.      ║
   ║  Jedlo = odpoveď na hlad. Stabilita = psychická práca.    ║
   ╚═══════════════════════════════════════════════════════════╝
═══════════════════════════════════════════════════════════════════ */