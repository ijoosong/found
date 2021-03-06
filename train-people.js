var clarifai;
var contact = 'contact';
var email = 'example@example.com';
var nombre = 'example';

$(document).ready(function() {
  clarifai = new Clarifai({
    'clientId': CLARIFAI_KEY,
    'clientSecret': CLARIFAI_SECRET
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

function tutorial() {
  swal({
    title: 'How this works',
    text: 'We know how hard it can be to lose a loved one in a crisis. We are here to help. <br> First, <span style="color:#F8BB86">Type in the name</span> of your loved one. Then, upload a photo of them, and hit, <span style="color:#F8BB86">Add Loved One</span>. You can repeat this as many times as you would like. <br> If you have found someone, add their name to the form, and hit, <span style="color:#F8BB86">Found Loved One</span>. If they are in the system, we will send an email indicating to their loved ones that they have been found!',
    html: true
  });
}

function nameSubmit() {
  nombre = $("#name").val();
}

function emailSubmit() {
  email = $("#email").val();
  contact = $("#contactname").val();
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
      if (obj.score < 0.45) {
        swal({
          title: 'We are sorry.',
          text: 'That person has not been found yet.',
          imageUrl: obj.url
        });
      } else {
        swal({
          title: 'This person, '+ nombre +', has been found!',
          text: 'Thank you so much for your efforts.'
        });
        var message = 'Hi '+contact+'!  We have exciting news for you.  It seems that we located your loved one, '+nombre+'!';
        $.ajax({
        type: "POST",
        url: 'https://mandrillapp.com/api/1.0/messages/send.json',
        data: {
          'key': EMAIL_SECRET,
          'message': {
            'from_email': APP_EMAIL,
            'to': [
                {
                  'email': email,
                  'name': contact,
                  'type': 'to'
                },
              ],
            'autotext': 'true',
            'subject': 'Your loved one has been found!',
            'html': message
          }
        }
       }).done(function(response) {
         console.log(response);
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
        Authorization: 'Client-ID ' + IMGUR_KEY
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
        Authorization: 'Client-ID ' + IMGUR_KEY
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
