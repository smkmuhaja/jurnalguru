const sheetID = "1TbJNaYqIROg056e2-9dtOFmTcBb2OmDR4rPUscGv_ig"; // ganti dengan ID Google Sheet
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

let absensiData = [];

function loadAbsensi() {
  fetch(sheetURL)
    .then(res => res.text())
    .then(data => {
      const json = JSON.parse(data.substr(47).slice(0, -2));
      const rows = json.table.rows;
      absensiData = rows.map(row => ({
        nama: row.c[0]?.v || "",
        kelas: row.c[1]?.v || "",
        tanggal: row.c[2]?.v || "",
        kegiatan: row.c[3]?.v || ""
      }));
      renderTable(absensiData);
    })
    .catch(err => console.error("Gagal load data:", err));
}

function renderTable(data) {
  const tbody = document.querySelector("#absensiTable tbody");
  tbody.innerHTML = "";
  data.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>${item.kelas}</td>
      <td>${item.tanggal}</td>
      <td>${item.kegiatan}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Filter pencarian
document.getElementById("searchInput").addEventListener("keyup", function(){
  const keyword = this.value.toLowerCase();
  const filtered = absensiData.filter(item =>
    item.nama.toLowerCase().includes(keyword) ||
    item.kelas.toLowerCase().includes(keyword)
  );
  renderTable(filtered);
});

// Form absen
document.getElementById("absenForm").addEventListener("submit", function(e){
  e.preventDefault();

  const formData = {
    nama: e.target.nama.value,
    kelas: e.target.kelas.value,
    kegiatan: e.target.kegiatan.value
  };

  fetch("https://script.google.com/macros/s/AKfycbywaDYywN94mB_Zfe0AZrrLrsefAIigtnC68LkNdMOKBNIDbr5CQWdHOp5MVVozzLoKuA/exec", {
    method: "POST",
    body: JSON.stringify(formData)
  })
  .then(response => response.text())
  .then(data => {
    document.getElementById("status").innerText = "✅ Absen berhasil dikirim!";
    e.target.reset();
    loadAbsensi(); // refresh tabel
  })
  .catch(error => {
    document.getElementById("status").innerText = "❌ Gagal mengirim absen.";
  });
});

// Export CSV
function exportCSV(data) {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Nama,Kelas,Tanggal,Kegiatan\n";
  data.forEach(item => {
    csvContent += `${item.nama},${item.kelas},${item.tanggal},${item.kegiatan}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "absensi_lpa.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
document.getElementById("exportBtn").addEventListener("click", function(){
  exportCSV(absensiData);
});

// Export Excel
function exportExcel(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");
  XLSX.writeFile(workbook, "absensi_lpa.xlsx");
}
document.getElementById("exportExcelBtn").addEventListener("click", function(){
  export