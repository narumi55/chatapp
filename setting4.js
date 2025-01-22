// トグルボタンとタイトル要素を取得
const checkbox0 = document.getElementById('switch0');
const title0 = document.getElementById('title0');
const checkbox1 = document.getElementById('switch1');
const title1 = document.getElementById('title1');
const checkbox2 = document.getElementById('switch2');
const title2 = document.getElementById('title2');
const checkbox3 = document.getElementById('switch3');
const title3 = document.getElementById('title3');
const checkbox4 = document.getElementById('switch4');
const title4 = document.getElementById('title4');
const checkbox5 = document.getElementById('switch5');
const title5 = document.getElementById('title5');
const checkbox6 = document.getElementById('switch6');
const title6 = document.getElementById('title6');
const checkbox7 = document.getElementById('switch7');
const title7 = document.getElementById('title7');
const checkbox8 = document.getElementById('switch8');
const title8 = document.getElementById('title8');

// トグルボタンとタイトルの状態を保存する関数
function toggleSwitch(checkbox, title, key) {
    checkbox.addEventListener('click', () => {
        title.textContent = checkbox.checked ? 'ON' : 'OFF';
        localStorage.setItem(key, checkbox.checked ? 'on' : 'off');
    });
}

// 状態を復元する関数
function restoreSwitchState(checkbox, title, key) {
    const savedState = localStorage.getItem(key);
    if (savedState) {
        checkbox.checked = savedState === 'on';
        title.textContent = savedState === 'on' ? 'ON' : 'OFF';
    }
}

// 各トグルボタンに関数を適用
toggleSwitch(checkbox0, title0, 'switch0State');
toggleSwitch(checkbox1, title1, 'switch1State');
toggleSwitch(checkbox2, title2, 'switch2State');
toggleSwitch(checkbox3, title3, 'switch3State');
toggleSwitch(checkbox4, title4, 'switch4State');
toggleSwitch(checkbox5, title5, 'switch5State');
toggleSwitch(checkbox6, title6, 'switch6State');
toggleSwitch(checkbox7, title7, 'switch7State');
toggleSwitch(checkbox8, title8, 'switch8State');

// ページロード時に状態を復元
document.addEventListener('DOMContentLoaded', () => {
    restoreSwitchState(checkbox0, title0, 'switch0State');
    restoreSwitchState(checkbox1, title1, 'switch1State');
    restoreSwitchState(checkbox2, title2, 'switch2State');
    restoreSwitchState(checkbox3, title3, 'switch3State');
    restoreSwitchState(checkbox4, title4, 'switch4State');
    restoreSwitchState(checkbox5, title5, 'switch5State');
    restoreSwitchState(checkbox6, title6, 'switch6State');
    restoreSwitchState(checkbox7, title7, 'switch7State');
    restoreSwitchState(checkbox8, title8, 'switch8State');
});