"use strict";

const API_ETH = "https://api.ethermine.org/networkStats";
const SECONDS_DAY = 86400;

//беру хэш рейт сети эфира из апи вычисляю хэш рейт пользователя (привожу его к h/s а потом уже считаю) потом я делю хэшрейт пользователя на хешрейт сети эфира и потом результат я умножаю на курс эфира в долларах

//overlay
const $overlay = document.querySelector(".overlay");

const $menu = document.querySelector(".header-content");
const $btnOpenMenu = document.querySelector(".header-menu");

//scroll panel width
const SCROLL_PANEL_WIDTH = window.innerWidth - document.documentElement.offsetWidth;

$btnOpenMenu.addEventListener("click", openMenu);
$overlay.addEventListener("click", closeMenu);

function openMenu() {
    document.body.style.paddingRight = SCROLL_PANEL_WIDTH + "px";
    document.body.style.overflowY = "hidden";
    $menu.classList.add("active");
    $overlay.classList.add("active");
}

function closeMenu() {
    $menu.classList.remove("active");
    $overlay.classList.remove("active");

    setTimeout(() => {
        document.body.style.paddingRight = "";
        document.body.style.overflowY = "auto";
    }, 200);
}


//calculator
const $inputHash = document.querySelector(".calc-input");
const $selectHash = document.querySelector(".select-hash");
const $calcBtn = document.querySelector(".calc-btn");
const $calcLoader = document.querySelector(".calculator-result-loader");
const $calcResultDefaultText = document.querySelector(".calculator-result-default");
const $calcResultWrap = document.querySelector(".calculator-result-number");
const $resultEthereum = document.querySelector(".calc-ethereum");
const $resultEthreumUSD = document.querySelector(".calc-ethereum-usd");

let hashValueAmount = "TH/s";

$calcBtn.addEventListener("click", calculate);

function calculate() {

    //check correct user input
    if (!checkInputHash()) return;

    $calcLoader.classList.add("active");
    disabledCalc();
    let valueUserHash = Number($inputHash.value);
    getResult(valueUserHash);

}

function checkInputHash() {

    if ($inputHash.value.trim() === "") return false;
    if (isNaN($inputHash.value)) return false;
    return true;

}

//disabled calc
function disabledCalc() {
    $calcBtn.classList.add("disabled");
    $selectHash.classList.add("disabled");
    $inputHash.setAttribute("disabled", "true");
}

function enabledCalc() {
    $calcBtn.classList.remove("disabled");
    $selectHash.classList.remove("disabled");
    $inputHash.removeAttribute("disabled");
}

//select
let items = [
    { value: "TH/s", id: 1 },
    { value: "Gh/s", id: 2 },
    { value: "Mh/s", id: 3 },
    { value: "Kh/s", id: 4 },
    { value: "H/s", id: 5 },
];

let select = new Select(".select-hash", { placeholder: "", items: items, selected: 1 });


function countIncome(hashrate, usd, inputHash) {

    let userHash;

    switch (hashValueAmount) {
        case "TH/s":
            userHash = 1000000000000 * inputHash;
            break;
        case "Gh/s":
            userHash = 1000000000 * inputHash;
            break;
        case "Mh/s":
            userHash = 1000000 * inputHash;
            break;
        case "Kh/s":
            userHash = 1000 * inputHash;
            break;
        default: 
            userHash = inputHash;
            break;
    }

    hashrate = hashrate * SECONDS_DAY / 14000;
    userHash = userHash * SECONDS_DAY;

    let resultIncomeEth = userHash / hashrate;
    let resultIncomeUsd = resultIncomeEth * usd;

    return { resultIncomeEth, resultIncomeUsd };

}

async function getResult(valueUser) {

    try {
        let response = await fetch(API_ETH);
        let data = await response.json();
        //current hashrate in h/s
        //current dollar from one ethreum
        let { hashrate, usd } = data.data;
        let results = countIncome(hashrate, usd, valueUser);
        outputResult(results.resultIncomeEth, results.resultIncomeUsd);
    } catch {
        outputError();
    } finally {
        $calcLoader.classList.remove("active");
        enabledCalc();
    }

}

function outputError() {
    $calcResultWrap.classList.remove("enabled");
    $calcResultDefaultText.textContent = "There are some problems, repeat again";
    $calcResultDefaultText.classList.remove("disabled");
}

function outputResult(resultIncomeEth, resultIncomeUsd) {
    $resultEthereum.textContent = resultIncomeEth.toFixed(6);
    $resultEthreumUSD.textContent = `($${resultIncomeUsd.toFixed(3)})`;
    $calcResultDefaultText.classList.add("disabled");
    $calcResultWrap.classList.add("enabled");
}

