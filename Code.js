function ngirimwa(event) {
    function getValueOrNull(fieldName) {
        return event.namedValues[fieldName] && event.namedValues[fieldName][0]
            ? event.namedValues[fieldName][0]
            : "NULL";
    }

    var nama = getValueOrNull("NAMA");
    var phone = convertToInternationalFormat(getValueOrNull("NOMOR WHATSAPP AKTIF PADA HP YANG DIGUNAKAN (FORMAT 08...)"));

    var userMessageTemplate = `Yth. Bapak/Ibu {{nama}}

Terima kasih telah berkunjung ke KPU Kota Mojokerto.

Sebagai bagian dari upaya peningkatan kualitas pelayanan publik, kami mohon kesediaan Bapak/Ibu untuk mengisi Survei Kepuasan Masyarakat dan Indeks Perilaku Anti Korupsi (IPAK) melalui tautan berikut:

https://bit.ly/SURVEI_SKM_IPAK_KPU_KOMO

Partisipasi Bapak/Ibu sangat berarti bagi peningkatan pelayanan kami.

Atas perhatian dan kerja samanya, kami ucapkan terima kasih.`;
    var adminMessageTemplate = `{{nama}} baru saja mengisi buku tamu digital KPU Kota Mojokerto`;

    var apiKey = "889a3cb3644a341e739e734e8683d500401ae75e482d2a638d974569029fc7c4";
    var adminTargets = "628123489077".split(",");

    var url = "https://dash.ngirimwa.com/api/v1/messages/send";

    var userMessage = renderTemplate(userMessageTemplate, {
        nama: nama,
        phone: phone,

    });

    sendMessage(phone, userMessage);

    var adminMessage = renderTemplate(adminMessageTemplate, {
        nama: nama,
        phone: phone,

    });

    adminTargets.forEach(function(target) {
        sendMessage(convertToInternationalFormat(target.trim()), adminMessage);
    });

    function sendMessage(to, message) {
        var payload = JSON.stringify({
            to: to,
            message: message
        });

        var options = {
            method: "post",
            contentType: "application/json",
            headers: { "x-api-key": apiKey },
            payload: payload
        };

        var response = UrlFetchApp.fetch(url, options);
        Logger.log(response.getContentText());
    }

    function renderTemplate(tpl, data) {
    return tpl
        .replaceAll('{{nama}}', data.nama)
        .replaceAll('{{phone}}', data.phone)
;
}
}

function convertToInternationalFormat(number) {
    if (!number) return null;
    var s = String(number).trim().replace(/[\s\-\(\)]/g, "");
    if (s.includes("@g.us")) return s;
    if (s.startsWith("+")) s = s.slice(1);
    if (s.startsWith("62")) return s;
    if (s.startsWith("0")) return "62" + s.slice(1);
    if (/^8\d{6,}$/.test(s)) return "62" + s;
    return s;
}

const SHEET_NAME = "Form Responses 1";

function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Survei Kepuasan Masyarakat")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(file){
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}

function cariDataByHP(nohp){

var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
var data = sh.getDataRange().getValues();

nohp = normalize(nohp);

for(var i=1;i<data.length;i++){

var hp = normalize(data[i][6]);

if(hp == nohp){

// cek apakah sudah pernah isi survei
var sudahIsi = data[i][12] && data[i][12] !== "";

return {
found:true,
sudahIsi:sudahIsi,
row:i+1,
data:{
nama:data[i][2],
email:data[i][1],
pekerjaan:data[i][3],
bertemu:data[i][4],
keperluan:data[i][5],
hp:data[i][6],
jk:data[i][7],
pendidikan:data[i][8],
pekerjaan2:data[i][9],
alamat:data[i][10],
usia:data[i][11]
}
}

}

}

return {found:false};

}

function loadForm(obj){

  var t = HtmlService.createTemplateFromFile("form");
  t.data = obj.data;
  t.row = obj.row;

  return t.evaluate().getContent();
}

function simpanSurvei(row,form){

var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

// cek apakah sudah isi survei (kolom M)
var cek = sh.getRange(row,13).getValue();

if(cek != ""){
return "SUDAH_ISI";
}

sh.getRange(row,13,1,15).setValues([[
form.q1,
form.q2,
form.q3,
form.q4,
form.q5,
form.q6,
form.q7,
form.q8,
form.q9,
form.kritik_saran,
form.ipak1,
form.ipak2,
form.ipak3,
form.ipak4,
form.ipak5
]]);

return "OK";

}

function normalize(num){

  if(!num) return "";

  num = String(num).replace(/\D/g,"");

  if(num.startsWith("0")){
    num = "62"+num.substring(1);
  }

  if(!num.startsWith("62")){
    num = "62"+num;
  }

  return num;
}