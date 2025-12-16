/* ===========================
   DATA GEJALA (S1–S22)
============================= */
const symptoms = [
    {code: "S1", text: "Menurunnya nafsu makan"},
    {code: "S2", text: "Bulu berdiri dan kusam"},
    {code: "S3", text: "Daya produktifitas melemah"},
    {code: "S4", text: "Kotoran lembek seperti diare"},
    {code: "S5", text: "Penurunan berat badan"},
    {code: "S6", text: "Demam"},
    {code: "S7", text: "Kambing lemas"},
    {code: "S8", text: "Tidak mau berdiri"},
    {code: "S9", text: "Kornea mata merah pekat"},
    {code: "S10", text: "Kotoran mata berlebih hingga mata tertutup"},
    {code: "S11", text: "Kropeng seperti bunga kol di mulut"},
    {code: "S12", text: "Lesi / luka pada mulut"},
    {code: "S13", text: "Perut kiri membesar"},
    {code: "S14", text: "Pernafasan lebih cepat"},
    {code: "S15", text: "Kulit terdapat luka"},
    {code: "S16", text: "Investasi larva pada luka"},
    {code: "S17", text: "Luka kropeng di telinga/leher/punggung"},
    {code: "S18", text: "Menggaruk tubuh yang luka"},
    {code: "S19", text: "Luka kropeng basah/kering"},
    {code: "S20", text: "Luka di sela kuku kaki"},
    {code: "S21", text: "Kuku kaki lepas"},
    {code: "S22", text: "Kesulitan berdiri"}
];

/* ===========================
   RULES R1–R8
============================= */
const rules = [
    {id: "R1", if: ["S1", "S2", "S3", "S4", "S5"], then: {code: "D1", name: "Helminthiasis (Cacingan)"}},
    {id: "R2", if: ["S1", "S6", "S4", "S7", "S8"], then: {code: "D2", name: "Enteritis"}},
    {id: "R3", if: ["S1", "S6", "S9", "S10"], then: {code: "D3", name: "Pink Eye"}},
    {id: "R4", if: ["S1", "S11", "S12"], then: {code: "D4", name: "Orf"}},
    {id: "R5", if: ["S1", "S13", "S14"], then: {code: "D5", name: "Bloat"}},
    {id: "R6", if: ["S1", "S15", "S16"], then: {code: "D6", name: "Myasis"}},
    {id: "R7", if: ["S1", "S15", "S17", "S18", "S19"], then: {code: "D7", name: "Scabies"}},
    {id: "R8", if: ["S6", "S14", "S20", "S21", "S22"], then: {code: "D8", name: "Foot Rot (Kuku Busuk)"}}
];

/* ===========================
   REKOMENDASI
============================= */
const recommendations = {
    D1: ["Obat cacing", "Perbaiki kebersihan kandang", "Periksa feses"],
    D2: ["Rehidrasi", "Obat anti infeksi sesuai dokter", "Pisahkan kambing sakit"],
    D3: ["Bersihkan mata", "Gunakan salep mata", "Hindari kontak"],
    D4: ["Bersihkan luka mulut", "Obat antiseptik", "Cek pakan"],
    D5: ["Kurangi pakan fermentasi", "Penanganan dokter bila parah"],
    D6: ["Bersihkan luka & ambil larva", "Gunakan antiseptik", "Jaga sanitasi"],
    D7: ["Obat kulit khusus scabies", "Karantina kambing", "Sterilisasi kandang"],
    D8: ["Rawat kuku", "Antibiotik sesuai dokter", "Minimalkan aktivitas"]
};

/* ===========================
   RENDER LIST GEJALA
============================= */
const listEl = document.getElementById("symptomList");
symptoms.forEach(s => {
    const wrap = document.createElement("div");
    wrap.className = "symptom-item";
    wrap.innerHTML = `
    <input id="cb_${s.code}" type="checkbox" data-code="${s.code}"/>
    <label for="cb_${s.code}">${s.text}</label>
    <div class="codes">${s.code}</div>
  `;
    listEl.appendChild(wrap);
});

const getChecked = () => Array.from(document.querySelectorAll("input[type=checkbox]"))
    .filter(c => c.checked)
    .map(c => c.dataset.code);

const wmEl = document.getElementById("workingMemory");
const stepsEl = document.getElementById("steps");
const conclusionBox = document.getElementById("conclusionBox");
const recommendationsEl = document.getElementById("recommendations");

/* ===========================
   RUN FORWARD CHAINING
============================= */
function runForwardChaining() {
    const WM = getChecked();
    stepsEl.innerHTML = "";
    wmEl.textContent = WM.length ? WM.join(", ") : "(tidak ada gejala dipilih)";

    const activated = [];
    const trace = [];

    // cek setiap rule
    rules.forEach(rule => {
        const checks = rule.if.map(c => ({cond: c, present: WM.includes(c)}));
        const fulfilled = checks.every(c => c.present);
        trace.push({rule: rule.id, checks, fulfilled, then: rule.then});
        if (fulfilled) activated.push(rule);
    });

    // tampilkan langkah
    trace.forEach(t => {
        const el = document.createElement("div");
        el.className = "step";
        el.innerHTML = `
      <strong>${t.rule}</strong> IF ${t.checks.map(c => c.cond).join(" AND ")} THEN ${t.then.name}<br><br>
      ${t.checks.map(c => `
        <div style="display:flex;justify-content:space-between">
          <div>${c.cond} — ${symptoms.find(s => s.code === c.cond).text}</div>
          <div>${c.present ? '<span class="match">Ada ✓</span>' : '<span class="nomatch">Tidak ada ✗</span>'}</div>
        </div>
      `).join("")}
      <br>
      ${t.fulfilled ? '<span class="match">→ Semua terpenuhi</span>' : '<span class="nomatch">→ Tidak terpenuhi</span>'}
    `;
        stepsEl.appendChild(el);
    });

    /* ===========================
       BEST MATCH RULE DI SINI
    ============================== */
    if (activated.length === 0) {
        let bestRule = null;
        let bestMatch = -1;

        rules.forEach(rule => {
            const matchCount = rule.if.filter(c => WM.includes(c)).length;
            if (matchCount > bestMatch) {
                bestMatch = matchCount;
                bestRule = rule;
            }
        });

        if (bestRule) {
            const total = bestRule.if.length;
            const percent = ((bestMatch / total) * 100).toFixed(0);

            conclusionBox.className = "conclusion ok";
            conclusionBox.innerHTML = `
        Tidak ada rule cocok sempurna.<br>
        <strong>Rule paling mendekati:</strong> ${bestRule.then.name}<br>
        Tingkat kecocokan: <strong>${bestMatch}/${total}</strong> (${percent}%)
      `;

            recommendationsEl.innerHTML = `
        <strong>Rekomendasi:</strong>
        <ul>${(recommendations[bestRule.then.code] || []).map(r => `<li>${r}</li>`).join("")}</ul>
      `;
        }
        return;
    }

    /* ===========================
       JIKA ADA RULE MATCH 100%
    ============================== */
    const primary = activated[0];
    conclusionBox.className = "conclusion ok";
    conclusionBox.innerHTML = `<strong>Diagnosa:</strong> ${primary.then.name}`;

    recommendationsEl.innerHTML = `
    <strong>Rekomendasi:</strong>
    <ul>${recommendations[primary.then.code].map(r => `<li>${r}</li>`).join("")}</ul>
  `;
}

/* ===========================
   EVENTS
============================= */
document.getElementById("diagnoseBtn").onclick = runForwardChaining;
document.getElementById("clearBtn").onclick = () => {
    document.querySelectorAll("input[type=checkbox]").forEach(c => c.checked = false);
    wmEl.textContent = "Belum ada input.";
    stepsEl.innerHTML = "";
    conclusionBox.className = "conclusion none";
    conclusionBox.textContent = "Belum ada kesimpulan.";
    recommendationsEl.innerHTML = "";
};