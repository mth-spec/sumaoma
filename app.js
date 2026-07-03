const message = document.getElementById('message');
const permissionBtn = document.getElementById('permissionBtn');

// ブラウザの音声APIサポート検出
const isSpeechRecognitionSupported = () => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

const isSpeechSynthesisSupported = () => {
    return !!window.speechSynthesis;
};

// iOSかどうかの判定
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

document.body.addEventListener('click', () => {
    startApp();
}, { once: true });

function startApp() {
    message.innerText = "準備中...";
    
    // 音声合成（読み上げ）
    if (isSpeechSynthesisSupported()) {
        const msg = new SpeechSynthesisUtterance();
        msg.lang = 'ja-JP';
        msg.text = "「スマホのオマケ」へようこそ。オマケを受け取る準備をしますね。画面に『許可』というボタンが出てくるので、それをダブルタップしてください。これは他のアプリでも使う大切な手続きですよ。";
        msg.rate = 1.0;
        msg.pitch = 1.0;
        msg.volume = 1.0;
        window.speechSynthesis.cancel(); // 前の再生をキャンセル
        window.speechSynthesis.speak(msg);
    }

    // 許可ボタンを表示
    permissionBtn.style.display = 'block';
    
    // 許可ボタンクリック時の処理
    permissionBtn.onclick = () => {
        permissionBtn.style.display = 'none';
        startRecognition();
    };
}

function startRecognition() {
    // 音声認識がサポートされているか確認
    if (!isSpeechRecognitionSupported()) {
        message.innerText = "お使いのブラウザでは音声認識が利用できません。\nマイクへのアクセスを許可してください。";
        return;
    }
    
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // iOSでの最適化設定
        recognition.lang = 'ja-JP';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
            message.innerText = "スマホに耳を貸す準備完了！\n（iPhoneの場合は画面下部の「マイク」をタップしてください）";
        };
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    message.innerText = `認識しました: ${transcript}`;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (interimTranscript) {
                message.innerText = `認識中: ${interimTranscript}`;
            }
        };
        
        recognition.onerror = (event) => {
            message.innerText = `エラーが発生しました: ${event.error}`;
            
            // iPhoneでのエラー処理
            if (isIOS()) {
                message.innerText = "マイクへのアクセスが許可されていません。\n設定から許可してください。";
            }
        };
        
        recognition.onend = () => {
            if (message.innerText.includes('認識中')) {
                message.innerText = "音声認識を終了しました。";
            }
        };
        
        recognition.start();
    } catch (error) {
        message.innerText = `エラー: ${error.message}`;
    }
}