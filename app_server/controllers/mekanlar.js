var request = require('postman-request');
var apiSecenekleri = {
  sunucu : "https://altinayefe1811012020.herokuapp.com",
  apiYolu: '/api/mekanlar/'
}

var istekSecenekleri
var footer="Altınay Efe 2021"

var mesafeyiFormatla = function (mesafe) {
  var yeniMesafe, birim;
  if (mesafe> 1000) {
    yeniMesafe= parseFloat(mesafe/1000).toFixed(2);
    birim = ' km';
  } else {
    yeniMesafe = parseFloat(mesafe).toFixed(1);
    birim = ' m';
  }
    return yeniMesafe + birim;
  }
var anaSayfaOlustur = function(req, res, cevap, mekanListesi){
  var mesaj;
if (!(mekanListesi instanceof Array)) {
  mesaj = "API HATASI: Bir şeyler ters gitti";
  mekanListesi = [];
} else {
  if (!mekanListesi.length) {
    mesaj = "Civarda herhangi bir mekan bulunamadı!";
  }
}
res.render('mekanlar-liste',
  {
  baslik: 'Mekan32',
  sayfaBaslik:{
    siteAd:'Mekan32',
    aciklama:'Isparta Civarındaki Mekanları Keşfedin!'
  },
  footer:footer,
  mekanlar:mekanListesi,
  mesaj: mesaj,
  cevap:cevap
});
}

const anaSayfa=function(req,res){
    istekSecenekleri =
    {
    url : apiSecenekleri.sunucu + apiSecenekleri.apiYolu,
    method: "GET",
    json : {},
    qs : {
      enlem: req.query.enlem,
      boylam: req.query.boylam
    }
  };
  request(
    istekSecenekleri,
    function(hata, cevap, mekanlar) {
      var i, gelenMekanlar;
      gelenMekanlar = mekanlar;
      if (!hata && gelenMekanlar.length) {
        for (i=0; i<gelenMekanlar.length; i++) {
          gelenMekanlar[i].mesafe =
          mesafeyiFormatla(gelenMekanlar[i].mesafe);
        }
      }
      anaSayfaOlustur(req, res, cevap, gelenMekanlar);
    }
  );
}
var detaySayfasiOlustur = function(req, res, mekanDetaylari){
  res.render('mekan-detay',
  {
    baslik: mekanDetaylari.ad,
    footer:footer,
    sayfaBaslik: mekanDetaylari.ad,
    mekanBilgisi: mekanDetaylari
  });
}

var hataGoster = function(req, res, durum){
  var baslik,icerik;
  if(durum==404){
    baslik="404, Sayfa Bulunamadı!";
    icerik="Kusura bakma sayfayı bulamadık!";
  }
  else{
    baslik=durum+", Bir şeyler ters gitti!";
    icerik="Ters giden bir şey var!";
  }
 res.status(durum);
 res.render('error',{
    baslik:baslik,
    icerik:icerik
 });
}

var mekanBilgisiGetir = function(req, res, callback) {
  istekSecenekleri={
    url : apiSecenekleri.sunucu + apiSecenekleri.apiYolu + req.params.mekanid,
    method : "GET",
    json : {}
  };
  request(
    istekSecenekleri,
    function(hata, cevap, mekanDetaylari) {
      var gelenMekan = mekanDetaylari;
      if (cevap.statusCode==200) {
        gelenMekan.koordinatlar = {
          enlem : mekanDetaylari.koordinatlar[0],
          boylam : mekanDetaylari.koordinatlar[1]
        };
        callback(req, res, gelenMekan);
      } else {
        hataGoster(req, res, cevap.statusCode);
      }
    }
    );
};

const mekanBilgisi = function (req, res, callback) {
  mekanBilgisiGetir(req, res, function(req, res, cevap) {
    detaySayfasiOlustur(req, res, cevap);
  });
};
var yorumSayfasiOlustur = function(req, res, mekanBilgisi) {
  res.render('yorum-ekle', { baslik: mekanBilgisi.ad+ ' Mekanına Yorum Ekle',
    sayfaBaslik:mekanBilgisi.ad+ ' Mekanına Yorum ekle',
    hata: req.query.hata,
    footer:footer
  });
};

const yorumEkle=function(req, res, next) {
  mekanBilgisiGetir(req, res, function(req, res, cevap) {
    yorumSayfasiOlustur(req, res, cevap);
  });
}

const yorumumuEkle=function(req, res){
  var istekSecenekleri, gonderilenYorum, mekanid;
  mekanid=req.params.mekanid;
  gonderilenYorum = {
    yorumYapan: req.body.name,
    puan: parseInt(req.body.rating, 10),
    yorumMetni: req.body.review
  };
  istekSecenekleri= {
    url : apiSecenekleri.sunucu + apiSecenekleri.apiYolu + mekanid + '/yorumlar',
    method: "POST",
    json : gonderilenYorum
  };
  if (!gonderilenYorum.yorumYapan || !gonderilenYorum.puan || !gonderilenYorum.yorumMetni) {
    res.redirect('/mekan/' + mekanid + '/yorum/yeni?hata=evet');
  } else {
    request(
      istekSecenekleri,
      function(hata, cevap, body) {
        if (cevap.statusCode === 201) {
          res.redirect('/mekan/' + mekanid);
        }
        else if (cevap.statusCode === 400 && body.name && body.name === "ValidationErroe") {
          res.redirect('/mekan/' + mekanid + '/yorum/yeni?hata=evet');
        }
        else {
          hataGoster(req, res, cevap.statusCode);
        }
      }
      );
  }
};
  
  module.exports={
  anaSayfa,
  mekanBilgisi,
  yorumEkle,
  yorumumuEkle
};