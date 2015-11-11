var clarifai;
var nombre = 'example';

$(document).ready(function() {
  clarifai = new Clarifai({
    'clientId': 'WB7TiuaBn8mW4fMtYVZKsu6Cj7kBBPm9KhLqfHiM',
    'clientSecret': '1GgaELc_KgYJ9wS4ut4V8BH7ZJErmyEwz7k88RRb'
  });
  $('#file-input').change(function(e) {
    var file = e.target.files[0],
        imageType = /image.*/;

    if (!file.type.match(imageType))
        return;

    var reader = new FileReader();
    reader.onload = fileOnload;
    reader.readAsDataURL(file);
  });

  function fileOnload(e) {
    var $img = $('<img>', { src: e.target.result });
    var canvas = $('#canvas')[0];
    var context = canvas.getContext('2d');

    $img.load(function() {
        context.drawImage(this, 0, 0);
    });
  }
});

function nameSubmit() {
  nombre = $("#name").val();
}

function positive(imgurl) {
  clarifai.positive(imgurl, nombre, callback).then(
    promiseResolved,
    promiseRejected
  );
}

function negative(imgurl) {
  clarifai.negative(imgurl, nombre, callback).then(
    promiseResolved,
    promiseRejected
  );
}

function train() {
  clarifai.train(nombre, callback).then(
    promiseResolved,
    promiseRejected
  );
}

function posTrain(imgurl) {
  clarifai.positive(imgurl, nombre, callback)
  .then(function() {
    train();
  });
}

function predict(imgurl) {
  clarifai.predict(imgurl, nombre, callback)
  .then(function(obj) {
      if (obj.score < 0.6) {
        swal({
          title: 'We are sorry.',
          text: 'That person has not been found yet.',
          imageUrl: obj.url
        });
      } else {
        swal({
          title: 'This person, '+ nombre +', has been found!',
          text: 'Thank you so much for your efforts.',
          imageUrl: obj.url
        });
      }
    },
    promiseRejected
  );
}

function promiseResolved(obj){
  console.log('Promise resolved', obj);
}

function promiseRejected(obj){
  console.log('Promise rejected', obj);
}

function callback(obj){
  console.log('callback', obj);
}

function trainPerson() {
  var img;
  try {
    img = document.getElementById('canvas').toDataURL('image/jpeg', 0.9).split(',')[1];
  } catch(e) {
    img = document.getElementById('canvas').toDataURL().split(',')[1];
  }

  var imageURL = '';

  $.ajax({
    url: 'https://api.imgur.com/3/image',
    type: 'post',
    headers: {
        Authorization: 'Client-ID b5bc03834968324'
    },
    data: {
        image: img
    },
    dataType: 'json',
    success: function(response) {
      if(response.success) {
        imageURL = response.data.link;
        posTrain(imageURL);
      }
    }
  });
}

function testPerson() {
  var img;
  try {
    img = document.getElementById('canvas').toDataURL('image/jpeg', 0.9).split(',')[1];
  } catch(e) {
    img = document.getElementById('canvas').toDataURL().split(',')[1];
  }

  var imageURL = '';

  $.ajax({
    url: 'https://api.imgur.com/3/image',
    type: 'post',
    headers: {
        Authorization: 'Client-ID b5bc03834968324'
    },
    data: {
        image: img
    },
    dataType: 'json',
    success: function(response) {
      if(response.success) {
        imageURL = response.data.link;
        predict(imageURL);
      }
    }
  });
}
