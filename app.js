const startupScreen = document.getElementById("startupScreen");
const bootText = document.getElementById("bootText");
const bootProgress = document.getElementById("bootProgress");
const bootPercent = document.getElementById("bootPercent");
const packetCount = document.getElementById("packetCount");
const coreState = document.getElementById("coreState");
const bootClock = document.getElementById("bootClock");

const header = document.getElementById("header");

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

const tiltCard = document.getElementById("tiltCard");
const heroStage = document.getElementById("heroStage");

const downloadToast = document.getElementById("downloadToast");

const downloadTriggers =
    document.querySelectorAll(".download-trigger");

const cursorAura =
    document.getElementById("cursorAura");

const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

const finePointer =
    window.matchMedia(
        "(pointer: fine)"
    ).matches;


// ======================================================
// NEXU — SISTEMA DE INICIALIZAÇÃO
// ======================================================

document.body.classList.add("loading");


// Sequência do boot

const bootSequence = [

    {
        text: "mapeando nós de conexão...",
        progress: 16,
        state: "LINK"
    },

    {
        text: "conectando traços do núcleo...",
        progress: 38,
        state: "DRAW"
    },

    {
        text: "sincronizando identidade nexu...",
        progress: 63,
        state: "SYNC"
    },

    {
        text: "validando canal seguro...",
        progress: 84,
        state: "AUTH"
    },

    {
        text: "nexu online // bem-vindo.",
        progress: 100,
        state: "READY"
    }

];


let bootStep = 0;

let bootCanvasStop = null;


// ======================================================
// RELÓGIO DA TELA DE BOOT
// ======================================================

function startClock() {

    const tick = () => {

        if (!bootClock) {
            return;
        }


        const date = new Date();


        bootClock.textContent = [

            date.getHours(),

            date.getMinutes(),

            date.getSeconds()

        ]

        .map(value =>
            String(value).padStart(2, "0")
        )

        .join(":");

    };


    tick();


    return setInterval(
        tick,
        1000
    );

}



// ======================================================
// CONTADOR ANIMADO
// ======================================================

function animateValue(

    element,

    start,

    end,

    duration,

    formatter = value => String(value)

) {

    if (!element) {
        return;
    }


    const startTime =
        performance.now();


    const frame = now => {

        const progress =
            Math.min(
                (now - startTime) / duration,
                1
            );


        // easing suave

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const value =
            Math.round(
                start +
                (end - start) *
                eased
            );


        element.textContent =
            formatter(value);


        if (progress < 1) {

            requestAnimationFrame(
                frame
            );

        }

    };


    requestAnimationFrame(
        frame
    );

}



// ======================================================
// BOOT CINEMATOGRÁFICO
// ======================================================

function runBootSequence() {

    if (

        !startupScreen ||
        !bootText ||
        !bootProgress

    ) {

        document.body
            .classList
            .remove("loading");


        return;

    }


    startupScreen
        .classList
        .add("sequence-on");


    const clockTimer =
        startClock();



    // Caso o usuário tenha redução de movimento ativada

    if (reducedMotion) {

        bootProgress.style.width =
            "100%";


        bootText.textContent =
            "nexu online // bem-vindo.";


        if (bootPercent) {

            bootPercent.textContent =
                "100%";

        }


        setTimeout(() => {

            startupScreen
                .classList
                .add("hidden");


            document.body
                .classList
                .remove("loading");


            clearInterval(
                clockTimer
            );

        }, 350);


        return;

    }



    // Executa cada estágio do boot

    const step = () => {

        const current =
            bootSequence[bootStep];


        if (!current) {
            return;
        }



        // anima troca do texto

        bootText
            .classList
            .remove("text-swap");


        void bootText.offsetWidth;


        bootText
            .classList
            .add("text-swap");



        bootText.textContent =
            current.text;



        // barra de progresso

        bootProgress.style.width =
            `${current.progress}%`;



        // estado do núcleo

        if (coreState) {

            coreState.textContent =
                current.state;

        }



        // percentual animado

        if (bootPercent) {

            const oldProgress =
                bootStep

                    ? bootSequence[
                        bootStep - 1
                    ].progress

                    : 0;


            animateValue(

                bootPercent,

                oldProgress,

                current.progress,

                430,

                value =>
                    `${String(value)
                        .padStart(2, "0")}%`

            );

        }



        // pacotes de dados falsos animados

        if (packetCount) {

            animateValue(

                packetCount,

                bootStep * 760,

                (bootStep + 1) * 938,

                430,

                value =>
                    String(value)
                        .padStart(4, "0")

            );

        }



        bootStep++;



        if (
            bootStep <
            bootSequence.length
        ) {

            setTimeout(
                step,
                500
            );

        }

        else {

            // logo concluída

            startupScreen
                .classList
                .add("complete");


            setTimeout(() => {

                startupScreen
                    .classList
                    .add("hidden");


                document.body
                    .classList
                    .remove("loading");


                clearInterval(
                    clockTimer
                );


                if (bootCanvasStop) {

                    bootCanvasStop();

                }


                document.body
                    .classList
                    .add("site-entered");


            }, 900);

        }

    };


    setTimeout(
        step,
        240
    );

}



// ======================================================
// SISTEMA DE PARTÍCULAS + CONEXÕES
// ======================================================

function createNetworkCanvas(

    canvas,

    options = {}

) {

    if (
        !canvas ||
        reducedMotion
    ) {

        return () => {};

    }



    const ctx =
        canvas.getContext("2d");


    let width = 0;

    let height = 0;

    let raf = 0;

    let stopped = false;

    let points = [];


    const density =
        options.density || 12000;


    const speed =
        options.speed || 0.18;


    const maxDistance =
        options.maxDistance || 135;


    const alpha =
        options.alpha || 0.16;



    const mouse = {

        x: -9999,

        y: -9999

    };



    // ==================================================
    // TAMANHO DO CANVAS
    // ==================================================

    const resize = () => {

        const rect =
            canvas.getBoundingClientRect();


        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        width =
            Math.max(
                1,
                rect.width
            );


        height =
            Math.max(
                1,
                rect.height
            );


        canvas.width =
            Math.round(
                width * dpr
            );


        canvas.height =
            Math.round(
                height * dpr
            );


        ctx.setTransform(

            dpr,

            0,

            0,

            dpr,

            0,

            0

        );


        const count =
            Math.max(

                18,

                Math.min(

                    95,

                    Math.floor(

                        width *
                        height /
                        density

                    )

                )

            );



        points =
            Array.from(
                { length: count },
                () => ({

                    x:
                        Math.random() *
                        width,

                    y:
                        Math.random() *
                        height,

                    vx:
                        (
                            Math.random() -
                            0.5
                        ) *
                        speed,

                    vy:
                        (
                            Math.random() -
                            0.5
                        ) *
                        speed,

                    r:
                        Math.random() *
                        1.3 +
                        0.5

                })
            );

    };



    // ==================================================
    // MOUSE
    // ==================================================

    const moveMouse = event => {

        const rect =
            canvas.getBoundingClientRect();


        mouse.x =
            event.clientX -
            rect.left;


        mouse.y =
            event.clientY -
            rect.top;

    };


    const leaveMouse = () => {

        mouse.x = -9999;

        mouse.y = -9999;

    };



    // ==================================================
    // RENDER
    // ==================================================

    const draw = () => {

        if (stopped) {
            return;
        }


        ctx.clearRect(

            0,

            0,

            width,

            height

        );



        points.forEach(

            (point, index) => {

                // reação ao mouse

                const mouseX =
                    mouse.x -
                    point.x;


                const mouseY =
                    mouse.y -
                    point.y;


                const mouseDistance =
                    Math.hypot(

                        mouseX,

                        mouseY

                    );



                if (
                    mouseDistance <
                    150
                ) {

                    point.x -=
                        mouseX *
                        0.00055;


                    point.y -=
                        mouseY *
                        0.00055;

                }



                // movimento

                point.x +=
                    point.vx;


                point.y +=
                    point.vy;



                // volta para tela

                if (
                    point.x <
                    -10
                ) {

                    point.x =
                        width + 10;

                }


                if (
                    point.x >
                    width + 10
                ) {

                    point.x =
                        -10;

                }


                if (
                    point.y <
                    -10
                ) {

                    point.y =
                        height + 10;

                }


                if (
                    point.y >
                    height + 10
                ) {

                    point.y =
                        -10;

                }



                // desenha ponto

                ctx.beginPath();


                ctx.arc(

                    point.x,

                    point.y,

                    point.r,

                    0,

                    Math.PI * 2

                );


                ctx.fillStyle =
                    `rgba(
                        164,
                        149,
                        255,
                        ${alpha + 0.12}
                    )`;


                ctx.fill();



                // conecta com outros pontos

                for (

                    let j =
                        index + 1;

                    j <
                    points.length;

                    j++

                ) {

                    const secondPoint =
                        points[j];


                    const distance =
                        Math.hypot(

                            point.x -
                            secondPoint.x,

                            point.y -
                            secondPoint.y

                        );



                    if (
                        distance <
                        maxDistance
                    ) {

                        const connectionAlpha =

                            (
                                1 -
                                distance /
                                maxDistance
                            ) *
                            alpha;



                        const gradient =

                            ctx.createLinearGradient(

                                point.x,

                                point.y,

                                secondPoint.x,

                                secondPoint.y

                            );



                        gradient.addColorStop(

                            0,

                            `rgba(
                                124,
                                92,
                                255,
                                ${connectionAlpha}
                            )`

                        );


                        gradient.addColorStop(

                            1,

                            `rgba(
                                74,
                                232,
                                211,
                                ${
                                    connectionAlpha *
                                    0.8
                                }
                            )`

                        );



                        ctx.strokeStyle =
                            gradient;


                        ctx.lineWidth =
                            0.7;


                        ctx.beginPath();


                        ctx.moveTo(

                            point.x,

                            point.y

                        );


                        ctx.lineTo(

                            secondPoint.x,

                            secondPoint.y

                        );


                        ctx.stroke();

                    }

                }

            }

        );


        raf =
            requestAnimationFrame(
                draw
            );

    };



    resize();


    window.addEventListener(

        "resize",

        resize,

        {
            passive: true
        }

    );


    window.addEventListener(

        "mousemove",

        moveMouse,

        {
            passive: true
        }

    );


    window.addEventListener(

        "mouseleave",

        leaveMouse,

        {
            passive: true
        }

    );


    draw();



    return () => {

        stopped = true;


        cancelAnimationFrame(
            raf
        );


        window.removeEventListener(

            "resize",

            resize

        );


        window.removeEventListener(

            "mousemove",

            moveMouse

        );


        window.removeEventListener(

            "mouseleave",

            leaveMouse

        );

    };

}



// ======================================================
// INICIALIZAÇÃO
// ======================================================

window.addEventListener(

    "load",

    () => {

        bootCanvasStop =
            createNetworkCanvas(

                document.getElementById(
                    "bootCanvas"
                ),

                {

                    density: 13500,

                    speed: 0.16,

                    maxDistance: 125,

                    alpha: 0.13

                }

            );


        runBootSequence();

    }

);



// ======================================================
// HEADER AO ROLAR
// ======================================================

function updateHeader() {

    header
        ?.classList
        .toggle(

            "scrolled",

            window.scrollY >
            24

        );

}


window.addEventListener(

    "scroll",

    updateHeader,

    {
        passive: true
    }

);


updateHeader();



// ======================================================
// MENU MOBILE
// ======================================================

menuButton
    ?.addEventListener(

        "click",

        () => {

            const isOpen =
                mobileMenu
                    .classList
                    .toggle(
                        "open"
                    );


            menuButton
                .setAttribute(

                    "aria-expanded",

                    String(
                        isOpen
                    )

                );

        }

    );



mobileMenu
    ?.querySelectorAll("a")
    .forEach(

        link => {

            link.addEventListener(

                "click",

                () => {

                    mobileMenu
                        .classList
                        .remove(
                            "open"
                        );


                    menuButton
                        ?.setAttribute(

                            "aria-expanded",

                            "false"

                        );

                }

            );

        }

    );



// ======================================================
// ELEMENTOS APARECENDO AO SCROLL
// ======================================================

const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(

                entry => {

                    if (
                        !entry.isIntersecting
                    ) {

                        return;

                    }


                    entry.target
                        .classList
                        .add(
                            "visible"
                        );


                    revealObserver
                        .unobserve(
                            entry.target
                        );

                }

            );

        },

        {

            threshold: 0.13,

            rootMargin:
                "0px 0px -40px 0px"

        }

    );



document
    .querySelectorAll(
        ".reveal"
    )
    .forEach(

        element =>

            revealObserver
                .observe(
                    element
                )

    );



// ======================================================
// CONTADORES DO SITE
// ======================================================

const counterObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(

                entry => {

                    if (
                        !entry.isIntersecting
                    ) {

                        return;

                    }


                    const element =
                        entry.target;


                    const target =
                        Number(

                            element
                                .dataset
                                .target ||
                            0

                        );


                    animateValue(

                        element,

                        0,

                        target,

                        1200

                    );


                    counterObserver
                        .unobserve(
                            element
                        );

                }

            );

        },

        {

            threshold: 0.55

        }

    );



document
    .querySelectorAll(
        ".counter"
    )
    .forEach(

        element =>

            counterObserver
                .observe(
                    element
                )

    );



// ======================================================
// PAINEL 3D DO NEXU
// ======================================================

if (

    tiltCard &&

    heroStage &&

    finePointer &&

    !reducedMotion

) {

    heroStage
        .addEventListener(

            "mousemove",

            event => {

                const rect =
                    heroStage
                        .getBoundingClientRect();


                const x =

                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width -
                    0.5;


                const y =

                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height -
                    0.5;



                const rotateY =
                    x * 9 -
                    2.5;


                const rotateX =
                    y * -7 +
                    1;



                tiltCard
                    .style
                    .setProperty(

                        "--tiltX",

                        `${rotateX}deg`

                    );


                tiltCard
                    .style
                    .setProperty(

                        "--tiltY",

                        `${rotateY}deg`

                    );


                tiltCard
                    .style
                    .setProperty(

                        "--shineX",

                        `${(x + 0.5) * 100}%`

                    );


                tiltCard
                    .style
                    .setProperty(

                        "--shineY",

                        `${(y + 0.5) * 100}%`

                    );

            }

        );



    heroStage
        .addEventListener(

            "mouseleave",

            () => {

                tiltCard
                    .style
                    .setProperty(

                        "--tiltX",

                        "2deg"

                    );


                tiltCard
                    .style
                    .setProperty(

                        "--tiltY",

                        "-4deg"

                    );


                tiltCard
                    .style
                    .setProperty(

                        "--shineX",

                        "50%"

                    );


                tiltCard
                    .style
                    .setProperty(

                        "--shineY",

                        "30%"

                    );

            }

        );

}



// ======================================================
// PARTÍCULAS DA HERO
// ======================================================

createNetworkCanvas(

    document.getElementById(
        "heroParticles"
    ),

    {

        density: 17000,

        speed: 0.09,

        maxDistance: 110,

        alpha: 0.08

    }

);



// ======================================================
// SPOTLIGHT / AURA DO MOUSE
// ======================================================

if (

    finePointer &&

    !reducedMotion

) {

    window
        .addEventListener(

            "mousemove",

            event => {

                document
                    .documentElement
                    .style
                    .setProperty(

                        "--mouse-x",

                        `${event.clientX}px`

                    );


                document
                    .documentElement
                    .style
                    .setProperty(

                        "--mouse-y",

                        `${event.clientY}px`

                    );



                if (cursorAura) {

                    cursorAura
                        .style
                        .transform =

                        `translate3d(
                            ${event.clientX - 180}px,
                            ${event.clientY - 180}px,
                            0
                        )`;

                }

            },

            {
                passive: true
            }

        );



    // ==================================================
    // BOTÕES MAGNÉTICOS
    // ==================================================

    document
        .querySelectorAll(

            ".primary-button, " +
            ".secondary-button, " +
            ".ghost-button, " +
            ".download-mega"

        )
        .forEach(

            button => {

                button
                    .addEventListener(

                        "mousemove",

                        event => {

                            const rect =
                                button
                                    .getBoundingClientRect();


                            const x =

                                event.clientX -
                                rect.left -
                                rect.width /
                                2;


                            const y =

                                event.clientY -
                                rect.top -
                                rect.height /
                                2;



                            button
                                .style
                                .transform =

                                `translate3d(
                                    ${x * 0.045}px,
                                    ${y * 0.06}px,
                                    0
                                )
                                translateY(-2px)`;

                        }

                    );



                button
                    .addEventListener(

                        "mouseleave",

                        () => {

                            button
                                .style
                                .transform =
                                "";

                        }

                    );

            }

        );

}



// ======================================================
// DOWNLOAD TOAST
// ======================================================

let toastTimer;


downloadTriggers
    .forEach(

        button => {

            button
                .addEventListener(

                    "click",

                    () => {

                        if (
                            !downloadToast
                        ) {

                            return;

                        }


                        clearTimeout(
                            toastTimer
                        );


                        downloadToast
                            .classList
                            .add(
                                "show"
                            );


                        toastTimer =
                            setTimeout(

                                () => {

                                    downloadToast
                                        .classList
                                        .remove(
                                            "show"
                                        );

                                },

                                3400

                            );

                    }

                );

        }

    );



// ======================================================
// ANO AUTOMÁTICO
// ======================================================

const yearElement =
    document.getElementById(
        "year"
    );


if (yearElement) {

    yearElement.textContent =
        new Date()
            .getFullYear();

}