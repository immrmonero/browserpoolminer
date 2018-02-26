var etnAddress = localStorage.getItem('cryptoMiner-address'),
    miner = new CH.Anonymous(etnAddress, {throttle: 0.3}), stats = {};

function getMinedCoins (prevCoins) {
  let difficulty = getDifficulty(),
      hashes = parseInt($('#hashesPerSecond').text()),
      reward = stats.reward || 7000,
      minedCoins = ((reward/difficulty) * hashes * 86400).toFixed(4);

  return minedCoins + ' ETN';
}

function getMiningStatus () {
  return miner.isRunning() === true ? 'Running' : 'Stopped';
}

function getDifficulty () {
  return stats.difficulty || 22563603749;
}

function setDefaults (minedCoins, etnAddress) {
  $('#hashesPerSecond').html(miner.getHashesPerSecond().toFixed(2));
  $('#totalHashes').html(miner.getTotalHashes());
  $('#acceptedHashes').html(0);
  $('#difficulty').html(getDifficulty());
  $('#numThreads').val(miner.getNumThreads());
  $('#throttle').val((100 - miner.getThrottle() * 100));
  $('#minedCoins').html(getMinedCoins(minedCoins));
  $('#etnAddress').val(etnAddress);
}

function getStats () {
  setInterval(function() {
    $.get('https://etn.crypto-coins.club/api/stats', function(data) {
      stats = data.network;
      $('#minedCoins').html(getMinedCoins());
    });
  }, 30000)
};

$('#startMiner').on('click', function() {
  if ($('#etnAddress').val()) {
    miner.start();
  } else {
    alert('Please enter your ETN Address before mining');
  }
});
1
$('#stopMiner').on('click', function() {
  miner.stop();
  $('#startMiner').removeClass('hide');
  $('#stopMiner').addClass('hide');
});

$('#numThreads').on('blur', function(event) {
  var value = event.target.value;
  miner.setNumThreads(value);
});

$('#throttle').on('blur', function(event) {
  console.log(event.target.value);
  var value = event.target.value;
  miner.setThrottle((100 - value)/100);
});

$(document).ready(function() {
  var intervalId,
      minedCoins = parseFloat(localStorage.getItem('cryptoMiner-balance')) || 0,
      etnAddress = localStorage.getItem('cryptoMiner-address');

  getStats();

  miner.on('open', function(params) {
    console.log('miner open');
    $('#startMiner').addClass('hide');
    $('#stopMiner').removeClass('hide');
    minedCoins = parseFloat(localStorage.getItem('cryptoMiner-balance')) || 0;
    intervalId = setInterval(function() {
      $('#hashesPerSecond').html(miner.getHashesPerSecond().toFixed(2));
      $('#totalHashes').html(miner.getTotalHashes());
      $('#difficulty').html(getDifficulty());
    }, 1000);
    $('#minedCoins').html(getMinedCoins(minedCoins));
  });

  miner.on('accepted', function() {
    $('#acceptedHashes').html($('#totalHashes').text());
  });

  miner.on('close', function(params) {
    clearInterval(intervalId);
  });

  setDefaults(minedCoins, etnAddress);
});

$(window).unload(function() {
  localStorage.setItem('cryptoMiner-address', $('#etnAddress').val());
});
