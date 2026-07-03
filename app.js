const message = document.getElementById('message');

document.body.addEventListener('click', () => {
    startApp();
}, { once: true });

function startApp() {
    message.innerText = "準備中...";
    
    // 音声合成（読み上げ）
    const msg = new SpeechSynthesisUtterance();
    msg.lang = 'ja-JP';
    msg.text = "「スマホのオマケ」へようこそ。オマケを受け取る準備をしますね。画面に『許可』というボタンが出てくるので、それをダブルタップしてください。これは他のアプリでも使う大切な手続きですよ。";
    window.speechSynthesis.speak(msg);

    // 音声認識の起動（ここでブラウザのマイク許可が出る）
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ja-JP';
    recognition.start();
    
    recognition.onstart = () => {
        message.innerText = "スマホに耳を貸す準備完了！";
    };
}