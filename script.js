step = 0
speak_div = document.getElementById("speak")

didfoundhandbook = false
didfoundnewspaper = false
didfoundcharger = false

timer_multiply = 1
rem_minutes = 0

delay = 30

old_dis = ""

nulled_time=false

was_the_last_text_a_person = false
time_waiting_for_an_answer_from_the_player = 0
tries_to_get_the_player_to_answer = 0
is_question_urgent=false
is_timer_enabled=true

is_portratit_mode = false

class Debug {
    no_time_pressure = false;
}

drawer_contents = [
    "<button class='drawer_item_button' onclick='foundhandbook()'>📒</button>",
    "<button class='drawer_item_button' onclick='foundnewspaper()'>📰</button>",
    "<button class='drawer_item_button' onclick='foundcharger()'>🔌</button>"
]

async function add_text(text, type){
    text = text.replace("$rem_minutes$", rem_minutes.toString())
    // Adds text to the textdiv
    div = document.getElementById("textdiv");
    if (type == 0) {
        div.innerHTML = "<p id=player></p>"+div.innerHTML;
        element = div.firstElementChild
        for (p=0;p<text.length;p++){
            element.textContent = element.textContent + text[p];
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        was_the_last_text_a_person = false
    } 
    if (type == 1) {
        element_name = (Math.round(Math.random()*9999999)).toString() 
        div.innerHTML = "<p id=game></p>"+div.innerHTML;
        element = div.firstElementChild
        for (p=0;p<text.length;p++){
            element.textContent = element.textContent + text[p];
            time_waiting_for_an_answer_from_the_player = 0;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        was_the_last_text_a_person = true;
        is_question_urgent = true;
        time_waiting_for_an_answer_from_the_player = 0;
    }
    if (type == 2) {
        element_name = (Math.round(Math.random()*9999999)).toString()  
        div.innerHTML = "<p id=naration></p>"+div.innerHTML;
        element = div.firstElementChild
        for (p=0;p<text.length;p++){
            element.textContent = element.textContent + text[p];
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        was_the_last_text_a_person = false
        is_question_urgent = false
    }
}

function update_timer(){
    if (nulled_time) {
        document.getElementById("timer").innerText = "T-0:00";
        return
    }
    if (!is_timer_enabled){
        document.getElementById("timer").innerText = "";
        return
    }
    time = (new Date().getTime() - start_time)*timer_multiply;
    time_remaining = new Date(900000-time);
    seconds = time_remaining.getSeconds();
    if (seconds<10){
        seconds_text = "0"+seconds.toString();
    } else { seconds_text = seconds.toString(); }
    timer_text = "T-"+time_remaining.getMinutes()+":"+seconds_text;
    rem_minutes = time_remaining.getMinutes()
    document.getElementById("timer").innerText = timer_text;
    if (rem_minutes==0 && seconds==0) {
        outOfTime()
    }
    if (is_question_urgent && !Debug.no_time_pressure) { time_waiting_for_an_answer_from_the_player+=1; }
    if (time_waiting_for_an_answer_from_the_player>12 && is_question_urgent){
        if (tries_to_get_the_player_to_answer<3){
            add_text("Do you hear me?", 1);
            time_waiting_for_an_answer_from_the_player = 0;
            tries_to_get_the_player_to_answer+=1;
        } else {
            didNotAnswerEnd();
        }
    }

    if ((is_portratit_mode && window.innerWidth/window.innerHeight>0.605) || (!is_portratit_mode && window.innerWidth/window.innerHeight<0.605)) {
        console.log("Recalculating...");
        displaySetting();
    }
}

function setTimeMultiplyer(x){
    timer_multiply = x;
}

async function update(text,next_fragment){
    // Handles the conversation logic
    if (next_fragment==-1){ 
        await add_text(text)
        speak_div.innerHTML = ""
        return
    }
    if (next_fragment==99990){
        document.getElementById("main").style.display = "none";
        document.getElementById("end1").style.display = "block";
        return
    }
    if (next_fragment==99991){
        document.getElementById("main").style.display = "none";
        document.getElementById("end2").style.display = "block";
        return
    }
    if (next_fragment>1000){
        next_fragment=next_fragment-10001;
        await add_text(text, 0)
        speak_div.innerHTML = ""
        await add_text(endings[next_fragment]["answer"], endings[next_fragment]["type"])
        for (i=0; i<endings[next_fragment]["answers"].length; i++){ // Goes through each possible answer from user and adds button for it.
            speak_div.innerHTML = speak_div.innerHTML + "<button onclick='update(this.innerHTML, "+ endings[next_fragment]["answers"][i][1] +")'>" + endings[next_fragment]["answers"][i][0] + "</button>"
        }
        localStorage.setItem("gameRunning", "false");
        return
    }
    speak_div.innerHTML = ""
    await add_text(text, 0)
    await new Promise(resolve => setTimeout(resolve, 250));
    await add_text(fragments[next_fragment]["answer"], fragments[next_fragment]["type"])
    for (i=0; i<fragments[next_fragment]["answers"].length; i++){ // Goes through each possible answer from user and adds button for it.
        speak_div.innerHTML = speak_div.innerHTML + "<button onclick='update(this.innerHTML, "+ fragments[next_fragment]["answers"][i][1] +")'>" + fragments[next_fragment]["answers"][i][0] + "</button>"
    }
    if (fragments[next_fragment]["effect"]!=undefined){
        effect = fragments[next_fragment]["effect"]
        if (effect=="foundHandbook") { // Outdated, left here for future guidance
            foundhandbook();
        }
        if (effect=="setTimerTo0") {
            start_time=new Date(start_time+900000).getTime();
            nulled_time = true;
        }
        if (effect=="disableTimer") {
            is_timer_enabled = false;
            is_question_urgent = false;
        }
    }
    step++;
}

function opendrawer(drawer) {

    document.getElementById("drawer_item").innerHTML=drawer_contents[drawer]

    document.getElementById("drawer_popup").style.display = "block";
    document.getElementById("conversation").style.display = "none";
    document.getElementById("table").style.display = "none";
}

function foundnewspaper(){
    if (didfoundnewspaper) {
        close_popup()
        return
    }
    didfoundnewspaper = true
    document.getElementById("founditems").innerHTML = document.getElementById("founditems").innerHTML + "<span id='founditem' onclick='opennews()'>📰</span>"
    close_popup()
}

function foundhandbook(){
    if (didfoundhandbook) {
        close_popup()
        return
    }
    didfoundhandbook = true
    document.getElementById("founditems").innerHTML = document.getElementById("founditems").innerHTML + "<span id='founditem' onclick='openhandbook()'>📒</span>"
    close_popup()
}

function foundcharger(){
    if (didfoundcharger) {
        close_popup()
        return
    }
    didfoundcharger = true
    document.getElementById("founditems").innerHTML = document.getElementById("founditems").innerHTML + "<span id='founditem'>🔌</span>"
    close_popup()
}

function pre2(){
    document.getElementById("pre2").style.display = "block";
    document.getElementById("pre1").style.display = "none";
}

function pre3(){
    document.getElementById("pre3").style.display = "block";
    document.getElementById("pre2").style.display = "none";
}

function main(){
    start_time = new Date().getTime();
    setInterval(()=>{
        update_timer()
    }, 1000);
    document.getElementById("main").style.display = "block";
    document.getElementById("pre3").style.display = "none";
    localStorage.setItem("gameRunning", "true");
}

function openhandbook(){
    document.getElementById("handbook").style.display = "block";
    document.getElementById("conversation").style.display = "none";
    document.getElementById("table").style.display = "none";
}

function opennews(){
    document.getElementById("newspaper").style.display = "block";
    document.getElementById("conversation").style.display = "none";
    document.getElementById("table").style.display = "none";
}

function openlaptop(){
    document.getElementById("laptop").style.display = "block";
    document.getElementById("conversation").style.display = "none";
    document.getElementById("table").style.display = "none";
}


function close_popup(){
    document.getElementById("drawer_popup").style.display = "none";
    document.getElementById("handbook").style.display = "none";
    document.getElementById("newspaper").style.display = "none";
    document.getElementById("laptop").style.display = "none";
    document.getElementById("conversation").style.display = "block";
    document.getElementById("table").style.display = "block";
}


function displaySetting() {
    displayWidth = window.innerWidth;
    displayHeight = window.innerHeight;

    // 16/9 = ~1.77
    // 9/16 = ~0.56
    // 1.77-0.56 = 1.21
    // 1.21/2 = 0.605
    // displayWidth/displayHeight < 0.605 => Portratit mode
    // displayWidth/displayHeight > 0.605 => Widescreen mode

    if (displayWidth/displayHeight<0.605) {
        is_portratit_mode = true;
    } else {
        is_portratit_mode = false;
        console.log("Set to Widescreen!");
        table = document.getElementById("table");
        con = document.getElementById("conversation");
        handbook = document.getElementById("handbook");
        newspaper = document.getElementById("newspaper");
        drawer = document.getElementById("drawer_popup");
        table.style.marginLeft = "72.5vw";
        table.style.width = "25vw";
        table.style.height = "25vh";
        con.style.marginTop = "0vh";
        con.style.width = "70vw";
        handbook.style.padding = "10px";
        handbook.style.width = "90vw";
        newspaper.style.padding = "10px";
        newspaper.style.width = "90vw";
        drawer.style.padding = "10px";
        drawer.style.width = "90vw";
        document.getElementsByName("laptop/phone")[0].innerText="💻";
        document.getElementById("laptop_display").style.width = "90vw";
        document.getElementById("table").style.height = "30vh";
    }

    if (is_portratit_mode) {
        table = document.getElementById("table");
        con = document.getElementById("conversation");
        handbook = document.getElementById("handbook");
        newspaper = document.getElementById("newspaper");
        drawer = document.getElementById("drawer_popup");
        table.style.marginLeft = 0;
        table.style.width = "95vw";
        table.style.height = "20vh";
        con.style.marginTop = "22.5vh";
        con.style.width = "90vw";
        handbook.style.padding = "10px";
        handbook.style.width = "90vw";
        newspaper.style.padding = "10px";
        newspaper.style.width = "90vw";
        drawer.style.padding = "10px";
        drawer.style.width = "90vw";
        document.getElementsByName("laptop/phone")[0].innerText="📱";
        document.getElementById("laptop_display").style.width = "90vw";
        document.getElementById("table").style.height = "30vh";
        document.getElementById("conversation").style.marginTop = "32.5vh";
    }
}

function outOfTime(){
    document.getElementById("main").style.display = "none";
    document.getElementById("outOfTimeEnd").style.display = "block";
}

function didNotAnswerEnd(){
    document.getElementById("main").style.display = "none";
    document.getElementById("didNotAnswerEnd").style.display = "block";
}

function opendocument(doc) {
    display = document.getElementById("laptop_display");
    pre_old_dis = old_dis // Allows for "2-depth" back function
    old_dis = display.innerHTML;
    display.innerHTML = "<button onclick='closedoc()' class='backBtn'>❌</button><hr>"+"<p class='laptop_document'>"+docs[doc]+"</p>"
}

function closedoc() {
    if (old_dis==display.innerHTML) {
        document.getElementById("laptop_display").innerHTML = pre_old_dis;
    } else {
        document.getElementById("laptop_display").innerHTML = old_dis;
    }
}

displaySetting();

document.addEventListener("visibilitychange", function() {
    if (document.hidden && localStorage.getItem("gameRunning")==="true") {
        setTimeout(() => {
            if (document.hidden) {
                // I don't know why I added it. It just seemed interesting.
                new Notification("There is not lot of time, Sir!", {
                    body: "We have " + rem_minutes.toString() + " minutes. We need to focus, Sir!",
                    icon: "/imgs/logo512.png"
                });
            }
        }, 2*60*1000); // 2 minutes in ms
    }
});