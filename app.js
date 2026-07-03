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

// 音声合成（読み上げ）用関数
function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'ja-JP';
    window.speechSynthesis.speak(msg);
}

// アプリの初期化（タップで開始）
document.body.addEventListener('click', () => {
    // 初回タップで音声を流して、ボタンを表示する
    speak("スマホのオマケへようこそ。画面の許可ボタンをダブルタップしてください。");
    permissionBtn.style.display = 'flex';
    message.innerText = "「許可」ボタンを\nダブルタップしてください";
}, { once: true });

// 許可ボタンの処理
permissionBtn.onclick = () => {
    permissionBtn.style.display = 'none';
    message.innerText = "マイク準備中...";
    startRecognition();
};

function startRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        message.innerText = "このブラウザでは音声入力が使えません。";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false; // 一回ごとに終了する設定
    recognition.interimResults = false; // 確定した結果のみ受け取る

    recognition.onstart = () => {
        if (isIOS()) {
            message.innerText = "準備完了！\n\n何か話しかけてください。\n\n（マイクボタンが出ない場合も\n話しかけるだけで認識します）";
        } else if (isAndroid()) {
            message.innerText = "準備完了！\n\n何か話しかけてください。\n\n（スマホが聞こえたことを\n読み上げます）";
        } else {
            message.innerText = "今から聞こえたことを\nそのまま読み上げます。\n何か話してね。";
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        message.innerText = `認識結果: ${transcript}`;
        // 自分の声をスマホに読み上げさせる（フィードバック）
        speak(transcript + "ですね");
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
                
                retryBtn.style.display = 'flex';
                retryBtn.onclick = () => {
                    location.reload();
                };
            } else {
                message.innerText = `エラー: ${event.error}\n設定から許可してください。`;
                retryBtn.style.display = 'flex';
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
                
                retryBtn.style.display = 'flex';
                retryBtn.onclick = () => {
                    location.reload();
                };
            } else {
                message.innerText = `エラー: ${event.error}\nマイク許可を確認してください。`;
                retryBtn.style.display = 'flex';
                retryBtn.onclick = () => {
                    location.reload();
                };
            }
        } else {
            message.innerText = `エラー: ${event.error}\nマイク設定を確認してください。`;
            retryBtn.style.display = 'flex';
        }
    };

    recognition.onend = () => {
        // 再度練習するためにボタンを復活させる
        if (!message.innerHTML.includes('設定手順')) {
            retryBtn.style.display = 'flex';
        }
    };

    recognition.start();
}

// リトライボタンの処理
retryBtn.onclick = () => {
    retryBtn.style.display = 'none';
    startRecognition();
};