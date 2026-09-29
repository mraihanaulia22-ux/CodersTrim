<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $appName ?? '__CT_PROJECT_NAME__' }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex min-h-screen items-center justify-center p-6 text-center">
    <div class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-xl max-w-md w-full">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 mb-6">
            <span class="text-2xl">👋</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white">Hello World!</h1>
        <p class="mt-2 text-sm text-slate-400">Welcome to <span class="font-semibold text-slate-200">{{ $appName ?? '__CT_PROJECT_NAME__' }}</span></p>

        <!-- @CodersTrim-Inject-Components -->
        <div class="mt-8 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 text-xs font-mono text-slate-400">
            Edit <span class="text-red-400">resources/views/welcome.blade.php</span> to get started
        </div>
    </div>

    @env('local')
    <!-- CodersTrim Floating Dev Toolbar (Local Environment Only) -->
    <div id="coderstrim-dev-toolbar" class="fixed bottom-5 right-5 z-40 flex items-center font-sans text-xs">
        <button id="ct-badge-btn" class="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-slate-300 shadow-2xl backdrop-blur-xl hover:bg-slate-800 transition">
            <span class="text-indigo-400">⚡</span>
            <span id="ct-width-display">---px</span>
        </button>
        <div id="ct-menu" class="hidden items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
            <button onclick="window.__ctSetMode('mobile')" class="rounded-full px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 transition">📱 390px</button>
            <button onclick="window.__ctSetMode('tablet')" class="rounded-full px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 transition">💻 768px</button>
            <button onclick="window.__ctSetMode('full')" class="rounded-full px-3 py-1.5 font-semibold text-indigo-400 hover:bg-slate-800 transition">🖥️ Full</button>
        </div>
    </div>
    <div id="ct-modal" class="fixed inset-0 z-50 hidden flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
        <div class="mb-4 flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-xs font-medium text-slate-300 shadow-2xl backdrop-blur-xl">
            <span class="font-semibold text-indigo-400">⚡ CodersTrim Preview</span>
            <button onclick="window.__ctSetMode('full')" class="rounded-lg bg-red-500/20 px-2.5 py-1 text-red-400 hover:bg-red-500/30 transition">✕ Exit</button>
        </div>
        <div id="ct-frame-container" class="relative flex flex-col overflow-hidden rounded-[44px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300">
            <iframe id="ct-iframe" src="" class="h-full w-full border-none pt-4 bg-slate-950"></iframe>
        </div>
    </div>
    <script>
    (function() {
        if (window.self !== window.top) {
            var tb = document.getElementById('coderstrim-dev-toolbar');
            if (tb) tb.style.display = 'none';
            return;
        }
        var badge = document.getElementById('ct-badge-btn');
        var menu = document.getElementById('ct-menu');
        var widthDisplay = document.getElementById('ct-width-display');
        var modal = document.getElementById('ct-modal');
        var iframe = document.getElementById('ct-iframe');
        var container = document.getElementById('ct-frame-container');
        function updateWidth() { if (widthDisplay) widthDisplay.textContent = window.innerWidth + 'px'; }
        window.addEventListener('resize', updateWidth);
        updateWidth();
        if (badge) {
            badge.addEventListener('click', function() {
                badge.classList.add('hidden');
                menu.classList.remove('hidden');
                menu.classList.add('flex');
            });
        }
        window.__ctSetMode = function(mode) {
            if (mode === 'full') {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                iframe.src = '';
            } else {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                iframe.src = window.location.href;
                if (mode === 'mobile') { container.style.width = '390px'; container.style.height = '844px'; }
                else if (mode === 'tablet') { container.style.width = '768px'; container.style.height = '1024px'; }
                container.style.maxHeight = '85vh';
            }
            menu.classList.add('hidden');
            menu.classList.remove('flex');
            badge.classList.remove('hidden');
        };
    })();
    </script>
    @endenv
</body>
</html>
