/* global Firebase: true */

'use strict';

$(document).ready(init);

var root, user, cash, folios;

function init(){
  root = new Firebase('https://myfolio.firebaseio.com/');
  user = root.child('user');
  cash = root.child('cash');
  folios = root.child('folios');
  var folio = folios.child('folio');
  folio.on('child_changed', updatePortfolio);
  user.on('value', userChanged);
  cash.on('value', balanceChanged);
  folios.on('child_added', newPortfolio);
  //folios.on('child_changed', updatePortfolio);

  //folio = folios.child('')
  //folios.child.on('child_change', updateBalance);
  $('#update-account').click(updateAccount);
  $('#create-folio').click(addFolio);
  $('#buyStocks').click(buyStocks);
}

function updatePortfolio(snapshot){
  var key = snapshot.key();
  var folioName = snapshot.val().name;
  var currentBalance = snapshot.val().balance;
  console.log(currentBalance);
  console.log(key);
  if (snapshot.val().stocks){
    var balance;
    console.log(snapshot.val().stocks);
    snapshot.val().stocks.forEach(function(stock){
      balance = (stock.shares * stock.position) + currentBalance;
    });
    var folio = folios.child(folioName);
    folio.update({balance: balance});
  }
}

function buyStocks(){
  var symbol = $('#stockID').val().toUpperCase();
  var key = $('#portfolio-list option').data('key');
  var shares = $('#shareNum').val() * 1;
  if (shares){
    var url = 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' +symbol+ '&callback=?';
    var position;
    $.getJSON(url, function(response){
      position = response.LastPrice * 1;
      var stock = {
        symbol : symbol,
        shares : shares,
        position: position};
      var stocks = folios.child(key).child('stocks');
      var folio = stocks.child(symbol);
      folio.set(stock);
    });
  }
}

function newPortfolio(snapshot){
  var key = snapshot.key();
  var folioName = snapshot.val().name;
  var $option = '<option selected="selected" data-key="'+key+'" >'+folioName+'</option>';
  if ($('#portfolio-list option').attr('selected','selected')){
    $('#portfolio-list option').attr('selected', '');
  }
  $('#portfolio-list').append($option);
}

function addFolio(){
  var folioName = $('#portfolioType').val().toUpperCase();
  $('#portfolioType').val('');
  var folio = folios.child(folioName);
  var emptyFolio = {name: folioName,
                    balance: 0};
  // folios.push(folio);
  folio.set(emptyFolio);
}

function balanceChanged(snapshot){
  var balance = snapshot.val();
  $('#total-balance').text('Total Account Balance: ' + balance);
}

function userChanged(snapshot){
  var name = snapshot.val();
  // console.log(snapshot.val());
  $('#owner').text('Account Owner: ' + name);
}

function updateAccount(){
  var name = $('#user').val();
  var balance = $('#balance').val();
  user.set(name);
  cash.set(balance);
  $('#name-div').remove();
  $('#balance-div').remove();
  $('#update-account').remove();
}
