const message = document.getElementById('message');
const permissionBtn = document.getElementById('permissionBtn');
const retryBtn = document.getElementById('retryBtn');

// アプリの初期化（タップで開始）
document.body.addEventListener('click', () => {
    // ブラウザのサポート確認
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        message.innerText = "お使いのブラウザでは音声入力が対応していません。\nChromeなど最新のブラウザをお試しください。";
        speak("お使いのブラウザでは音声入力が対応していません。Chromeなど最新のブラウザをお試しください。");
        return;
    }
    
    if (!window.speechSynthesis) {
        message.innerText = "お使いのブラウザでは音声読み上げが対応していません。\nChromeなど最新のブラウザをお試しください。";
        speak("お使いのブラウザでは音声読み上げが対応していません。");
        return;
    }
    
    // 初回タップでゲーム開始
    permissionBtn.style.display = 'none';
    message.innerText = "じゃんけん準備中...";
    speak("じゃんけんゲームへようこそ。グー、チョキ、パーのどれかを言ってください。");
    startJanken();
}, { once: true });

// 許可ボタンの処理（使わなくなるが、念のため残す）
permissionBtn.onclick = () => {
    permissionBtn.style.display = 'none';
    message.innerText = "じゃんけん準備中...";
    startJanken();
};

function startJanken() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        message.innerText = "このブラウザでは音声入力が使えません。";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        message.innerText = "じゃーんけーん…\nはい！";
        speak("じゃんけん、ぽん！");
    };

    recognition.onresult = (event) => {
        const input = event.results[0][0].transcript;
        const myHand = input.includes('グー') ? 'グー' : 
                     input.includes('チョキ') ? 'チョキ' : 
                     input.includes('パー') ? 'パー' : null;

        if (!myHand) {
            message.innerText = "聞き取れませんでした。\nもう一度言ってください。";
            speak("もう一度言ってください");
            retryBtn.style.display = 'flex';
            retryBtn.innerText = "もう一回";
            retryBtn.onclick = () => {
                retryBtn.style.display = 'none';
                startJanken();
            };
            return;
        }

        const hands = ['グー', 'チョキ', 'パー'];
        const cpuHand = hands[Math.floor(Math.random() * 3)];
        
        let result = "";
        if (myHand === cpuHand) result = "あいこです";
        else if ((myHand === 'グー' && cpuHand === 'チョキ') || 
                 (myHand === 'チョキ' && cpuHand === 'パー') || 
                 (myHand === 'パー' && cpuHand === 'グー')) result = "あなたの勝ちです";
        else result = "あなたの負けです";

        message.innerText = `あなた: ${myHand}\n相手: ${cpuHand}\n結果: ${result}`;
        speak(`あなたは${myHand}。私は${cpuHand}。${result}！`);
        retryBtn.style.display = 'flex';
        retryBtn.innerText = "もう一回";
        retryBtn.onclick = () => {
            retryBtn.style.display = 'none';
            startJanken();
        };
    };

    recognition.onerror = (event) => {
        message.innerText = `エラーが発生しました: ${event.error}`;
        speak(`エラー。${event.error}`);
        
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
            }
        }
        
        retryBtn.style.display = 'flex';
    };

    recognition.onend = () => {
        // 結果画面が表示されている場合は、ボタンはすでに表示済み
    };

    try {
        recognition.start();
    } catch (error) {
        message.innerText = `エラー: ${error.message}`;
        speak(`エラーが発生しました。${error.message}`);
        retryBtn.style.display = 'flex';
    }
}