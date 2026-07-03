const message = document.getElementById('message');
const permissionBtn = document.getElementById('permissionBtn');
const retryBtn = document.getElementById('retryBtn');

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

// Androidかどうかの判定
const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
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
    permissionBtn.style.display = 'flex';
    
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
            if (isIOS()) {
                message.innerText = "準備完了！\n\n画面下部にマイクボタンが出たら\nタップしてください。\n\nマイクボタンが出ない場合は、\nこのページをリロードしてから\n設定を確認してください。";
            } else {
                message.innerText = "スマホに耳を貸す準備完了！";
            }
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
            // iPhoneでのエラー処理
            if (isIOS()) {
                if (event.error === 'not-allowed' || event.error === 'network') {
                    message.innerHTML = "マイクへのアクセスが許可されていません。<br><br>" +
                        "【iPhone設定手順】<br>" +
                        "1. ホーム画面で「設定」を開く<br>" +
                        "2. 「Safari」を探してタップ<br>" +
                        "3. 「マイク」を探してタップ<br>" +
                        "4. 「許可」に変更<br>" +
                        "5. このページをリロードして再度お試しください";
                    
                    retryBtn.style.display = 'block';
                    retryBtn.onclick = () => {
                        location.reload();
                    };
                } else {
                    message.innerText = `エラー: ${event.error}\n設定から許可してください。`;
                    retryBtn.style.display = 'block';
                    retryBtn.onclick = () => {
                        location.reload();
                    };
                }
            } else if (isAndroid()) {
                if (event.error === 'not-allowed' || event.error === 'network') {
                    message.innerHTML = "マイクへのアクセスが許可されていません。<br><br>" +
                        "【Android設定手順】<br>" +
                        "1. 設定アプリを開く<br>" +
                        "2. 「アプリと通知」または「アプリケーション」をタップ<br>" +
                        "3. 使用しているブラウザ（Chrome等）を選択<br>" +
                        "4. 「権限」または「パーミッション」をタップ<br>" +
                        "5. 「マイク」を「許可」に変更<br>" +
                        "6. このページをリロードして再度お試しください";
                    
                    retryBtn.style.display = 'block';
                    retryBtn.onclick = () => {
                        location.reload();
                    };
                } else {
                    message.innerText = `エラー: ${event.error}\nマイク許可を確認してください。`;
                    retryBtn.style.display = 'block';
                    retryBtn.onclick = () => {
                        location.reload();
                    };
                }
            } else {
                message.innerText = `エラーが発生しました: ${event.error}`;
                retryBtn.style.display = 'block';
                retryBtn.onclick = () => {
                    location.reload();
                };
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