(function () {
    'use strict';

    const TH = window.TavernHelper;
    if (!TH || typeof TH.getVariables !== 'function') {
        console.warn('[自定义系统] 未检测到 JS-Slash-Runner / TavernHelper，脚本终止。');
        return;
    }

    const NS = 'nailong_system_panel';
    const LS_KEY = 'nlsp_api_config';
    const LS_FULL_KEY = 'nlsp_full_state';
    const OVERLAY_ID = 'nlsp-overlay';
    const STYLE_ID = 'nlsp-style';

    const DRAW_COST_ONE = 100;
    const DRAW_COST_TEN = 900;
    const PANEL_PRESETS = {
        'tall-3-4': { name: '竖向 3:4（高面板）', width: 660, height: 880 },
        'classic-4-3': { name: '经典 4:3', width: 920, height: 690 },
        'square-1-1': { name: '方形 1:1', width: 760, height: 760 },
        'photo-5-4': { name: '舒展 5:4', width: 900, height: 720 },
        'wide-16-10': { name: '宽屏 16:10', width: 1040, height: 650 },
        'wide-16-9': { name: '宽屏 16:9', width: 1120, height: 630 },
        'ultrawide-21-9': { name: '超宽 21:9', width: 1260, height: 540 }
    };

    /* 官方预设接口（均以 OpenAI 兼容路径结尾） */
    const API_PRESETS = [
        { id: 'openai',   name: 'OpenAI',   url: 'https://api.openai.com/v1',                              hint: '官方 OpenAI' },
        { id: 'gemini',   name: 'Gemini',   url: 'https://generativelanguage.googleapis.com/v1beta/openai', hint: 'Google Gemini（OpenAI 兼容端点）' },
        { id: 'deepseek', name: 'DeepSeek', url: 'https://api.deepseek.com/v1',                            hint: '深度求索' },
        { id: 'claude',   name: 'Claude',   url: 'https://api.anthropic.com/v1',                           hint: 'Anthropic Claude' }
    ];
    function presetByUrl(url) {
        const u = String(url || '').trim().replace(/\/+$/, '');
        return API_PRESETS.find((p) => p.url === u);
    }

    const cyber = { cyan: '#38e0ff', blue: '#2b6bff', deep: '#06121f', deep2: '#0a2438', accent: '#5cd6ff' };

    /* huashu-design 全息科幻五主题 */
    const THEMES = {"hl-light":{"name":"亮蓝全息","icon":"☀","desc":"浅蓝基底·全息科幻","var":{"bg":"#d8e6f6","bg2":"#c8ddf0","topBg":"rgba(195,215,240,.92)","text":"#0c1c30","title":"#051028","muted":"rgba(35,60,105,.88)","accent":"#0e58b8","accent2":"#064098","neon":"rgba(45,135,225,.92)","neon2":"rgba(18,65,150,.82)","success":"#186840","warn":"#9c6020","pur":"#5248b0","err":"#c02838","cardBg":"rgba(218,235,250,.94)","cardBorder":"rgba(38,105,185,.28)","inputBg":"rgba(232,240,252,.96)","inputBorder":"rgba(32,95,170,.28)","btnBg":"rgba(12,60,138,.8)","btnBg2":"rgba(16,85,172,.58)","btnBorder":"rgba(42,125,210,.42)","btnText":"#e6f2ff","btnBgH":"rgba(16,78,165,.88)","btnBg2H":"rgba(22,105,208,.7)","shellBorder":"rgba(42,105,178,.24)","msgUser":"rgba(155,198,235,.84)","msgAi":"rgba(212,234,250,.92)","warnColor":"#9c6020","overlay":"rgba(165,202,236,.84)","vignette":"rgba(145,185,220,.5)","w":"rgba(0,0,0,.04)","ballBg":"rgba(185,208,238,.88)","ballBgH":"rgba(165,190,228,.94)"}},"hl-dark":{"name":"暗色全息","icon":"🌙","desc":"深炭黑底·青蓝霓虹","var":{"bg":"#060e1a","bg2":"#0a1628","topBg":"rgba(14,22,45,.65)","text":"#c8ddf8","title":"#e4eeff","muted":"rgba(130,180,220,.58)","accent":"#60b0f8","accent2":"#2880d0","neon":"rgba(100,190,255,.92)","neon2":"rgba(40,120,210,.82)","success":"#38a068","warn":"#c8a050","pur":"#8878e0","err":"#f05878","cardBg":"rgba(10,20,45,.65)","cardBorder":"rgba(35,95,195,.22)","inputBg":"rgba(6,14,30,.85)","inputBorder":"rgba(35,95,195,.28)","btnBg":"rgba(18,55,125,.72)","btnBg2":"rgba(28,85,175,.52)","btnBorder":"rgba(55,145,240,.38)","btnText":"#c0def8","btnBgH":"rgba(28,75,155,.82)","btnBg2H":"rgba(38,105,215,.62)","shellBorder":"rgba(55,85,128,.2)","msgUser":"rgba(28,75,155,.48)","msgAi":"rgba(10,20,45,.65)","warnColor":"#c8a050","overlay":"rgba(3,6,14,.84)","vignette":"transparent","w":"rgba(255,255,255,.03)","ballBg":"rgba(12,22,45,.72)","ballBgH":"rgba(28,55,125,.82)"}},"hl-blood":{"name":"暗红血族","icon":"🩸","desc":"绯红深渊·血族纹章","var":{"bg":"#0c0606","bg2":"#140a0a","topBg":"rgba(30,10,10,.7)","text":"#e8d0d0","title":"#ffd0d0","muted":"rgba(190,140,140,.6)","accent":"#c83038","accent2":"#981820","neon":"rgba(255,70,70,.9)","neon2":"rgba(200,30,30,.8)","success":"#58a040","warn":"#c89830","pur":"#9050b0","err":"#ff4040","cardBg":"rgba(22,8,8,.72)","cardBorder":"rgba(170,35,40,.28)","inputBg":"rgba(14,6,6,.9)","inputBorder":"rgba(170,35,40,.32)","btnBg":"rgba(140,20,30,.72)","btnBg2":"rgba(180,40,50,.52)","btnBorder":"rgba(220,50,60,.42)","btnText":"#ffe0e0","btnBgH":"rgba(160,28,38,.84)","btnBg2H":"rgba(200,48,58,.64)","shellBorder":"rgba(140,25,35,.24)","msgUser":"rgba(180,40,50,.48)","msgAi":"rgba(22,8,8,.72)","warnColor":"#c89830","overlay":"rgba(6,3,3,.86)","vignette":"transparent","w":"rgba(255,255,255,.03)","ballBg":"rgba(22,8,8,.78)","ballBgH":"rgba(140,20,30,.72)"}},"hl-green":{"name":"清新翠绿","icon":"🌿","desc":"晨露新叶·自然清新","var":{"bg":"#e6f4e6","bg2":"#d6ecd6","topBg":"rgba(200,230,200,.92)","text":"#122812","title":"#081c08","muted":"rgba(40,100,40,.88)","accent":"#289040","accent2":"#187030","neon":"rgba(50,190,70,.92)","neon2":"rgba(25,140,45,.82)","success":"#2a8048","warn":"#b08030","pur":"#7050b8","err":"#d84040","cardBg":"rgba(222,244,224,.94)","cardBorder":"rgba(35,145,55,.28)","inputBg":"rgba(234,248,235,.96)","inputBorder":"rgba(28,125,45,.28)","btnBg":"rgba(18,115,38,.8)","btnBg2":"rgba(25,145,50,.58)","btnBorder":"rgba(45,175,65,.42)","btnText":"#e6ffe8","btnBgH":"rgba(22,135,45,.88)","btnBg2H":"rgba(30,165,58,.7)","shellBorder":"rgba(38,125,55,.24)","msgUser":"rgba(168,222,178,.84)","msgAi":"rgba(218,242,222,.92)","warnColor":"#b08030","overlay":"rgba(172,222,182,.84)","vignette":"rgba(145,205,160,.5)","w":"rgba(0,0,0,.04)","ballBg":"rgba(192,222,198,.88)","ballBgH":"rgba(172,208,182,.94)"}},"hl-gold":{"name":"帝王鎏金","icon":"👑","desc":"御旨金纹·帝王威仪","var":{"bg":"#181208","bg2":"#221808","topBg":"rgba(35,20,8,.72)","text":"#f0e8d0","title":"#ffe8a0","muted":"rgba(195,175,120,.62)","accent":"#d4a030","accent2":"#b08020","neon":"rgba(240,200,60,.92)","neon2":"rgba(200,150,30,.82)","success":"#58a840","warn":"#e0b040","pur":"#9070c8","err":"#e85050","cardBg":"rgba(28,18,6,.72)","cardBorder":"rgba(175,135,30,.28)","inputBg":"rgba(18,12,5,.9)","inputBorder":"rgba(175,135,30,.32)","btnBg":"rgba(150,110,20,.72)","btnBg2":"rgba(190,140,30,.52)","btnBorder":"rgba(220,165,45,.42)","btnText":"#fff8e0","btnBgH":"rgba(170,130,28,.84)","btnBg2H":"rgba(210,158,38,.64)","shellBorder":"rgba(145,105,25,.24)","msgUser":"rgba(180,135,35,.48)","msgAi":"rgba(28,18,6,.72)","warnColor":"#e0b040","overlay":"rgba(8,6,2,.86)","vignette":"transparent","w":"rgba(255,255,255,.04)","ballBg":"rgba(28,18,6,.78)","ballBgH":"rgba(150,110,20,.72)"}},"hl-purple":{"name":"梦幻紫晶","icon":"🔮","desc":"暗紫深渊·水晶幻境","var":{"bg":"#0e0a1a","bg2":"#140e26","topBg":"rgba(20,14,38,.72)","text":"#d8c8f0","title":"#ece0ff","muted":"rgba(160,130,200,.62)","accent":"#a860e8","accent2":"#8040c8","neon":"rgba(180,120,255,.92)","neon2":"rgba(130,70,210,.82)","success":"#50b070","warn":"#d0a050","pur":"#c070e0","err":"#e85090","cardBg":"rgba(18,10,32,.72)","cardBorder":"rgba(120,60,180,.28)","inputBg":"rgba(10,6,20,.9)","inputBorder":"rgba(120,60,180,.32)","btnBg":"rgba(80,30,140,.72)","btnBg2":"rgba(120,50,180,.52)","btnBorder":"rgba(160,80,220,.42)","btnText":"#f0e0ff","btnBgH":"rgba(100,40,160,.84)","btnBg2H":"rgba(140,60,200,.64)","shellBorder":"rgba(80,40,120,.24)","msgUser":"rgba(120,50,180,.48)","msgAi":"rgba(18,10,32,.72)","warnColor":"#d0a050","overlay":"rgba(6,3,12,.86)","vignette":"transparent","w":"rgba(255,255,255,.03)","ballBg":"rgba(18,10,32,.78)","ballBgH":"rgba(80,30,140,.72)"}},"hl-cyber":{"name":"赛博朋克","icon":"🌃","desc":"霓虹粉青·未来都市","var":{"bg":"#0a0a12","bg2":"#0e0e1c","topBg":"rgba(14,14,28,.75)","text":"#d0e8f0","title":"#00ffe8","muted":"rgba(100,180,200,.6)","accent":"#ff2a8a","accent2":"#cc1066","neon":"rgba(0,255,224,.92)","neon2":"rgba(0,200,180,.82)","success":"#00ff80","warn":"#ffcc00","pur":"#c040ff","err":"#ff3060","cardBg":"rgba(12,12,24,.72)","cardBorder":"rgba(0,200,180,.25)","inputBg":"rgba(8,8,16,.9)","inputBorder":"rgba(255,42,138,.3)","btnBg":"rgba(180,20,80,.72)","btnBg2":"rgba(0,150,140,.52)","btnBorder":"rgba(0,255,224,.4)","btnText":"#e0fff8","btnBgH":"rgba(220,30,100,.84)","btnBg2H":"rgba(0,200,180,.64)","shellBorder":"rgba(0,150,140,.22)","msgUser":"rgba(180,20,80,.45)","msgAi":"rgba(12,12,24,.72)","warnColor":"#ffcc00","overlay":"rgba(4,4,8,.88)","vignette":"transparent","w":"rgba(0,255,224,.02)","ballBg":"rgba(12,12,24,.78)","ballBgH":"rgba(0,150,140,.72)"}},"hl-ocean":{"name":"深海蔚蓝","icon":"🌊","desc":"幽蓝深海·潮汐涌动","var":{"bg":"#04161e","bg2":"#061e28","topBg":"rgba(6,30,40,.72)","text":"#b8e0e8","title":"#e0f8ff","muted":"rgba(100,160,180,.6)","accent":"#20c8d0","accent2":"#1090a0","neon":"rgba(40,200,220,.92)","neon2":"rgba(20,140,170,.82)","success":"#30b888","warn":"#d0a040","pur":"#6080d0","err":"#e85060","cardBg":"rgba(6,22,30,.72)","cardBorder":"rgba(30,160,180,.26)","inputBg":"rgba(4,16,22,.9)","inputBorder":"rgba(30,160,180,.3)","btnBg":"rgba(16,80,100,.72)","btnBg2":"rgba(20,120,140,.52)","btnBorder":"rgba(40,200,220,.4)","btnText":"#e0f8ff","btnBgH":"rgba(20,100,120,.84)","btnBg2H":"rgba(30,160,180,.64)","shellBorder":"rgba(20,100,120,.22)","msgUser":"rgba(20,120,140,.45)","msgAi":"rgba(6,22,30,.72)","warnColor":"#d0a040","overlay":"rgba(2,10,14,.86)","vignette":"transparent","w":"rgba(40,200,220,.025)","ballBg":"rgba(6,22,30,.78)","ballBgH":"rgba(16,80,100,.72)"}},"hl-sakura":{"name":"樱花纷飞","icon":"🌸","desc":"粉樱暖阳·温柔梦境","var":{"bg":"#fce8ee","bg2":"#f8dce6","topBg":"rgba(245,215,228,.92)","text":"#2a0e1a","title":"#1a0612","muted":"rgba(120,60,90,.88)","accent":"#e85090","accent2":"#c83070","neon":"rgba(232,80,144,.92)","neon2":"rgba(200,48,112,.82)","success":"#40a068","warn":"#c08030","pur":"#9060c0","err":"#d83048","cardBg":"rgba(252,232,238,.94)","cardBorder":"rgba(200,80,130,.28)","inputBg":"rgba(255,240,245,.96)","inputBorder":"rgba(200,80,130,.28)","btnBg":"rgba(200,48,112,.8)","btnBg2":"rgba(232,80,144,.58)","btnBorder":"rgba(240,100,160,.42)","btnText":"#fff0f5","btnBgH":"rgba(220,58,122,.88)","btnBg2H":"rgba(245,100,165,.7)","shellBorder":"rgba(200,80,130,.24)","msgUser":"rgba(232,168,195,.84)","msgAi":"rgba(252,232,238,.92)","warnColor":"#c08030","overlay":"rgba(232,188,210,.84)","vignette":"rgba(220,170,195,.5)","w":"rgba(0,0,0,.03)","ballBg":"rgba(245,210,225,.88)","ballBgH":"rgba(232,180,200,.94)"}},"hl-ink":{"name":"水墨丹青","icon":"🖌","desc":"宣纸墨韵·古风雅致","var":{"bg":"#f5f2ee","bg2":"#ede8e0","topBg":"rgba(230,222,210,.92)","text":"#2a2a2a","title":"#0a0a0a","muted":"rgba(80,75,70,.88)","accent":"#8a6a3a","accent2":"#6a5028","neon":"rgba(138,106,58,.82)","neon2":"rgba(106,80,40,.72)","success":"#4a8050","warn":"#a07820","pur":"#604878","err":"#a83838","cardBg":"rgba(245,240,232,.94)","cardBorder":"rgba(120,100,70,.25)","inputBg":"rgba(250,248,242,.96)","inputBorder":"rgba(120,100,70,.25)","btnBg":"rgba(70,55,35,.82)","btnBg2":"rgba(100,80,50,.6)","btnBorder":"rgba(138,106,58,.4)","btnText":"#f5f0e8","btnBgH":"rgba(90,70,45,.9)","btnBg2H":"rgba(120,95,60,.72)","shellBorder":"rgba(100,85,60,.22)","msgUser":"rgba(180,165,140,.7)","msgAi":"rgba(245,240,232,.92)","warnColor":"#a07820","overlay":"rgba(200,190,175,.82)","vignette":"rgba(180,170,155,.4)","w":"rgba(0,0,0,.04)","ballBg":"rgba(225,215,200,.88)","ballBgH":"rgba(205,195,178,.94)"}},"hl-scifi":{"name":"全息科幻","icon":"🔷","desc":"磨砂玻璃·全息色散·粒子扫描","var":{"bg":"#0a1428","bg2":"#0e1a34","topBg":"rgba(14,26,52,.85)","text":"#c0dcf8","title":"#a0e0ff","muted":"rgba(140,180,220,.58)","accent":"#40b8f0","accent2":"#2890d0","neon":"rgba(100,200,255,.92)","neon2":"rgba(40,140,220,.82)","success":"#30c080","warn":"#d0a040","pur":"#8060e0","err":"#f05070","cardBg":"rgba(12,24,48,.7)","cardBorder":"rgba(60,160,240,.25)","inputBg":"rgba(8,16,32,.85)","inputBorder":"rgba(60,160,240,.28)","btnBg":"rgba(20,80,160,.7)","btnBg2":"rgba(30,110,200,.5)","btnBorder":"rgba(80,180,255,.4)","btnText":"#c0e0ff","btnBgH":"rgba(28,100,190,.8)","btnBg2H":"rgba(40,130,230,.6)","shellBorder":"rgba(60,120,200,.2)","msgUser":"rgba(30,90,160,.5)","msgAi":"rgba(12,24,48,.7)","warnColor":"#d0a040","overlay":"rgba(4,8,18,.88)","vignette":"rgba(30,60,120,.15)","w":"rgba(255,255,255,.03)","ballBg":"rgba(14,26,52,.75)","ballBgH":"rgba(28,60,120,.85)"}},"hl-xianxia":{"name":"国风水墨","icon":"🏮","desc":"云纹金边·灵气光雾·宣纸肌理","var":{"bg":"#120e0a","bg2":"#1a1410","topBg":"rgba(26,20,16,.85)","text":"#e0d0b0","title":"#d0b870","muted":"rgba(160,130,80,.6)","accent":"#c0a050","accent2":"#a08030","neon":"rgba(100,200,180,.82)","neon2":"rgba(60,160,140,.62)","success":"#50a060","warn":"#c09040","pur":"#8060a0","err":"#c04848","cardBg":"rgba(25,18,12,.7)","cardBorder":"rgba(190,160,90,.22)","inputBg":"rgba(18,14,10,.85)","inputBorder":"rgba(190,160,90,.25)","btnBg":"rgba(100,70,30,.7)","btnBg2":"rgba(140,100,40,.5)","btnBorder":"rgba(190,160,90,.38)","btnText":"#e8d8b0","btnBgH":"rgba(120,85,38,.8)","btnBg2H":"rgba(160,115,50,.6)","shellBorder":"rgba(120,90,50,.2)","msgUser":"rgba(100,75,35,.45)","msgAi":"rgba(25,18,12,.7)","warnColor":"#c09040","overlay":"rgba(8,5,3,.88)","vignette":"rgba(40,25,15,.3)","w":"rgba(255,255,255,.02)","ballBg":"rgba(26,20,16,.78)","ballBgH":"rgba(100,70,30,.75)"}},"hl-solo":{"name":"暗黑硬核","icon":"⚔","desc":"银灰棱角·金属冷峻·几何切割","var":{"bg":"#0e0e12","bg2":"#121216","topBg":"rgba(18,18,22,.9)","text":"#c0c4cc","title":"#a0a8b8","muted":"rgba(130,138,150,.6)","accent":"#a0a8b8","accent2":"#788090","neon":"rgba(170,180,195,.72)","neon2":"rgba(120,130,145,.52)","success":"#48a058","warn":"#b09838","pur":"#6858a0","err":"#c04848","cardBg":"rgba(18,18,24,.8)","cardBorder":"rgba(170,180,195,.15)","inputBg":"rgba(12,12,16,.9)","inputBorder":"rgba(170,180,195,.15)","btnBg":"rgba(40,42,50,.8)","btnBg2":"rgba(55,58,68,.6)","btnBorder":"rgba(170,180,195,.28)","btnText":"#c0c8d8","btnBgH":"rgba(50,52,62,.9)","btnBg2H":"rgba(65,68,78,.7)","shellBorder":"rgba(100,105,115,.2)","msgUser":"rgba(50,52,60,.5)","msgAi":"rgba(18,18,24,.8)","warnColor":"#b09838","overlay":"rgba(5,5,8,.9)","vignette":"transparent","w":"rgba(255,255,255,.02)","ballBg":"rgba(18,18,22,.85)","ballBgH":"rgba(40,42,50,.8)"}},"hl-neon":{"name":"赛博霓虹","icon":"🌆","desc":"洋红青蓝·故障全息·电路暗纹","var":{"bg":"#08080e","bg2":"#0c0c14","topBg":"rgba(12,12,20,.85)","text":"#b8e0e8","title":"#ff2a8a","muted":"rgba(100,160,180,.6)","accent":"#ff2a8a","accent2":"#00ffe8","neon":"rgba(0,255,230,.85)","neon2":"rgba(255,42,138,.65)","success":"#00e080","warn":"#e0c040","pur":"#a040ff","err":"#ff3060","cardBg":"rgba(12,12,20,.7)","cardBorder":"rgba(0,255,230,.18)","inputBg":"rgba(8,8,14,.9)","inputBorder":"rgba(255,42,138,.25)","btnBg":"rgba(160,20,80,.6)","btnBg2":"rgba(0,160,140,.4)","btnBorder":"rgba(0,255,230,.35)","btnText":"#e0fff8","btnBgH":"rgba(200,28,100,.7)","btnBg2H":"rgba(0,200,180,.5)","shellBorder":"rgba(100,0,50,.2)","msgUser":"rgba(160,20,80,.4)","msgAi":"rgba(12,12,20,.7)","warnColor":"#e0c040","overlay":"rgba(4,2,8,.9)","vignette":"rgba(20,0,20,.3)","w":"rgba(0,255,230,.02)","ballBg":"rgba(12,12,20,.8)","ballBgH":"rgba(0,120,110,.7)"}}};

    function getTavernContextSafe() {
        try {
            if (window.parent && window.parent.SillyTavern && typeof window.parent.SillyTavern.getContext === 'function') {
                return window.parent.SillyTavern.getContext() || {};
            }
        } catch (e) {}
        return {};
    }

    function getUserBinding() {
        const ctx = getTavernContextSafe();
        let name = String(ctx.name1 || '').trim();
        let avatar = '';
        let description = '';
        try {
            avatar = String(ctx.userAvatar || ctx.user_avatar || (window.parent && window.parent.user_avatar) || '').trim();
        } catch (e) {}
        try {
            description = String(
                ctx.personaDescription || ctx.persona_description ||
                (ctx.powerUserSettings && ctx.powerUserSettings.persona_description) ||
                (window.parent && window.parent.power_user && window.parent.power_user.persona_description) || ''
            ).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        } catch (e) {}
        if (!name) name = 'USER';
        const rawId = (avatar || name || 'USER').toLowerCase();
        return { id: encodeURIComponent(rawId).slice(0, 120), name: name, avatar: avatar, description: description };
    }

    function getStateStorageKey() {
        return LS_FULL_KEY + ':user:' + getUserBinding().id;
    }

    function getApiStorageKey() {
        return LS_KEY + ':user:' + getUserBinding().id;
    }

    function makeId(prefix) {
        return String(prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    }

    function redactSensitive(value) {
        return String(value == null ? '' : value)
            .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi, 'Bearer [REDACTED]')
            .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/gi, '[REDACTED_API_KEY]')
            .replace(/([?&](?:api[_-]?key|token|secret)=)[^&\s]+/gi, '$1[REDACTED]')
            .slice(0, 2400);
    }

    function recordDebugError(feature, error, phase, details) {
        try {
            if (!state || !Array.isArray(state.debugErrors)) return;
            const message = redactSensitive(error && error.message ? error.message : error);
            const stack = redactSensitive(error && error.stack ? error.stack : '');
            state.debugErrors.push({
                id: makeId('error'),
                time: Date.now(),
                feature: String(feature || '未知功能').slice(0, 60),
                phase: String(phase || '运行').slice(0, 80),
                message: message || '未知错误',
                details: redactSensitive(details || stack || '')
            });
            state.debugErrors = state.debugErrors.slice(-120);
        } catch (ignored) {}
    }

    function setDebugHealth(key, ok, detail) {
        if (!state || !state.debugHealth) return;
        state.debugHealth[key] = { ok: ok === true, detail: String(detail || ''), checkedAt: Date.now() };
    }

    function getDefaultState() {
        return {
            schema: 4,
            enabled: false,
            connected: false,
            initialized: false,
            points: 0,
            api: { url: '', key: '', model: '', models: [], maxTokens: 30000 },
            system: { name: '', purpose: '', summary: '', greeting: '' },
            worldbook: { name: '', summary: '', entries: [] },
            tasks: [],
            shop: [],
            inventory: [],
            draws: [],
            chat: [],
            theme: 'hl-dark',
            exclusiveFunctions: [],
            exclusivePreferences: [],
            exclusiveFunctionCount: 1,
            exclComplexity: 'simple',
            autoRefresh: false,
            contextFloors: 10,
            refreshInterval: 1,
            panelW: 0,
            panelH: 0,
            scaleLocked: true,
            fontScale: 1,
            layoutPreset: 'wide-16-9',
            shopMemory: [],
            autoTaskSettlement: true,
            taskSettlementMinConfidence: 0.78,
            taskSettlementHistory: [],
            lastTaskContextFingerprint: '',
            debugErrors: [],
            debugHealth: {},
            userBinding: getUserBinding()
        };
    }

    let state = loadState();

    function loadState() {
        let s = getDefaultState();
        /* 优先从 localStorage 还原完整设置 */
        try {
            const ls = window.parent && window.parent.localStorage ? window.parent.localStorage : window.localStorage;
            const scopedKey = getStateStorageKey();
            const fullRaw = ls.getItem(scopedKey) || ls.getItem(LS_FULL_KEY);
            if (fullRaw) {
                const fullState = JSON.parse(fullRaw);
                if (fullState && typeof fullState === 'object') {
                    const def = getDefaultState();
                    s = Object.assign(def, fullState);
                    s.schema = def.schema;
                    s.api = Object.assign(def.api, (fullState && fullState.api) || {});
                    s.system = Object.assign(def.system, (fullState && fullState.system) || {});
                    s.worldbook = Object.assign(def.worldbook, (fullState && fullState.worldbook) || {});
                    delete s.persona;
                    if (!Array.isArray(s.tasks)) s.tasks = [];
                    if (!Array.isArray(s.shop)) s.shop = [];
                    if (!Array.isArray(s.inventory)) s.inventory = [];
                    if (!Array.isArray(s.draws)) s.draws = [];
                    if (!Array.isArray(s.chat)) s.chat = [];
                    if (!Array.isArray(s.shopMemory)) s.shopMemory = [];
                    if (!Array.isArray(s.taskSettlementHistory)) s.taskSettlementHistory = [];
                    if (!Array.isArray(s.debugErrors)) s.debugErrors = [];
                    if (!s.debugHealth || typeof s.debugHealth !== 'object') s.debugHealth = {};
                    if (!Array.isArray(s.exclusiveFunctions)) s.exclusiveFunctions = [];
                    if (!Array.isArray(s.exclusivePreferences)) s.exclusivePreferences = [];
                    if (typeof s.exclusiveFunctionCount !== 'number' || s.exclusiveFunctionCount < 1) s.exclusiveFunctionCount = 1;
                    if (s.exclComplexity !== 'simple' && s.exclComplexity !== 'complex') s.exclComplexity = 'simple';
                    if (typeof s.exclCostPoints !== 'boolean') s.exclCostPoints = false;
                    if (typeof s.autoRefresh !== 'boolean') s.autoRefresh = false;
                    if (typeof s.contextFloors !== 'number' || s.contextFloors < 1) s.contextFloors = 10;
                    if (typeof s.refreshInterval !== 'number' || s.refreshInterval < 1) s.refreshInterval = 1;
                    if (typeof s.panelW !== 'number' || s.panelW < 0) s.panelW = 0;
                    if (typeof s.panelH !== 'number' || s.panelH < 0) s.panelH = 0;
                    if (typeof s.scaleLocked !== 'boolean') s.scaleLocked = true;
                    if (typeof s.fontScale !== 'number' || s.fontScale < .75 || s.fontScale > 1.5) s.fontScale = 1;
                    if (!PANEL_PRESETS[s.layoutPreset]) s.layoutPreset = 'wide-16-9';
                    if (typeof s.autoTaskSettlement !== 'boolean') s.autoTaskSettlement = true;
                    if (typeof s.taskSettlementMinConfidence !== 'number') s.taskSettlementMinConfidence = .78;
                    if (!s.theme || !THEMES[s.theme]) s.theme = 'hl-dark';
                    s.userBinding = getUserBinding();
                    s.tasks = (s.tasks || []).map(function(t, i){
                        if (!t.id) t.id = makeId('task') + '-' + i;
                        if (t.status === 'done' && typeof t.rewardClaimed !== 'boolean') t.rewardClaimed = true;
                        return t;
                    });
                    return s;
                }
            }
        } catch (e) {
            console.warn('[自定义系统] localStorage 全量读取失败：', e);
        }

        /* 从 localStorage 还原 API 配置（跨会话持久） */
        try {
            const ls = window.parent && window.parent.localStorage ? window.parent.localStorage : window.localStorage;
            const raw = ls.getItem(getApiStorageKey()) || ls.getItem(LS_KEY);
            if (raw) {
                const cfg = JSON.parse(raw);
                if (cfg) {
                    if (typeof cfg.url === 'string') s.api.url = cfg.url;
                    if (typeof cfg.key === 'string') s.api.key = cfg.key;
                    if (typeof cfg.model === 'string') s.api.model = cfg.model;
                    if (Array.isArray(cfg.models)) s.api.models = cfg.models;
                    if (cfg.connected) s.connected = true;
                }
            }
        } catch (e) {
            console.warn('[自定义系统] localStorage 读取失败：', e);
        }
        return s;
    }

    function saveState() {
        try {
            const ls = window.parent && window.parent.localStorage ? window.parent.localStorage : window.localStorage;
            state.userBinding = getUserBinding();
            ls.setItem(getStateStorageKey(), JSON.stringify(state));
        } catch (e) {
            console.warn('[自定义系统] localStorage 全量保存失败：', e);
            recordDebugError('用户存档', e);
        }
    }

    function saveApiToLS() {
        try {
            const ls = window.parent && window.parent.localStorage ? window.parent.localStorage : window.localStorage;
            ls.setItem(getApiStorageKey(), JSON.stringify({
                url: state.api.url,
                key: state.api.key,
                model: state.api.model,
                models: state.api.models,
                connected: !!state.connected
            }));
        } catch (e) {
            console.warn('[自定义系统] localStorage 写入失败：', e);
        }
    }
    function clearSettings() {
        const keepApi = JSON.parse(JSON.stringify(state.api));
        const keepConnected = !!state.connected;
        const def = getDefaultState();
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            state[keys[i]] = def[keys[i]];
        }
        state.api = keepApi;
        state.connected = keepConnected;
        state.initialized = false;
        try {
            const ls = window.parent && window.parent.localStorage ? window.parent.localStorage : window.localStorage;
            ls.removeItem(getStateStorageKey());
        } catch (e) {}
        saveApiToLS();
        saveState();
        closePanel();
        setTimeout(() => openPanel(), 120);
    }

    function toast(message, type) {
        try {
            if (window.toastr && typeof window.toastr[type || 'info'] === 'function') {
                window.toastr[type || 'info'](message, '系统面板');
            } else {
                console.log('[自定义系统]', message);
            }
        } catch (e) {
            console.log('[自定义系统]', message);
        }
    }

    function applyTheme(key){var th=THEMES[key]||THEMES["hl-dark"];var v=th.var;var r=getDoc().documentElement.style;
    var themeCls='theme-'+key.replace('hl-','');
    try{var sh=getDoc().querySelector('.nlsp-shell');if(sh){sh.className=sh.className.replace(/\s*theme-\S+/g,'')+' '+themeCls;}}catch(e){}
    try{var ov=getDoc().getElementById(OVERLAY_ID);if(ov){ov.className=ov.className.replace(/\s*theme-\S+/g,'')+' '+themeCls;}}catch(e){}var ks=["bg","text","title","muted","accent","accent2","neon","neon2","success","warn","pur","err","cardBg","cardBorder","inputBg","inputBorder","btnBg","btnBg2","btnBorder","btnText","btnBgH","btnBg2H","shellBorder","msgUser","msgAi","warnColor","overlay","vignette","w","topBg","bg2","ballBg","ballBgH"];for(var i=0;i<ks.length;i++){var k=ks[i];if(v[k]!==undefined)r.setProperty("--t-"+k,v[k]);}r.setProperty('--nlsp-font-scale',String(state.fontScale||1));}
function injectFont() {
        const doc = getDoc();
        const style = doc.createElement('style');
        style.id = 'nlsp-font';
        style.textContent = '@font-face{font-family:Tourney;src:url(https://cdn.jsdelivr.net/gh/Etcetera-Type-Co/Tourney@master/fonts/webfonts/Tourney-Regular.woff2) format("woff2");font-weight:400;font-style:normal;font-display:swap}@font-face{font-family:Tourney;src:url(https://cdn.jsdelivr.net/gh/Etcetera-Type-Co/Tourney@master/fonts/webfonts/Tourney-SemiBold.woff2) format("woff2");font-weight:600;font-style:normal;font-display:swap}@font-face{font-family:Tourney;src:url(https://cdn.jsdelivr.net/gh/Etcetera-Type-Co/Tourney@master/fonts/webfonts/Tourney-Bold.woff2) format("woff2");font-weight:700;font-style:normal;font-display:swap}@font-face{font-family:Tourney;src:url(https://cdn.jsdelivr.net/gh/Etcetera-Type-Co/Tourney@master/fonts/webfonts/Tourney-ExtraBold.woff2) format("woff2");font-weight:900;font-style:normal;font-display:swap}';
        doc.head.appendChild(style);
    }

    function ensureStyle() {
        const doc = getDoc();
        if (doc.getElementById(STYLE_ID)) return;
        applyTheme(state.theme || 'hl-dark');
        const css = `*{box-sizing:border-box;margin:0;padding:0}
a{text-decoration:none;color:inherit}
#${OVERLAY_ID}{position:absolute;top:0;left:0;width:100%;height:100%;z-index:999999;font-family:"Tourney","Microsoft YaHei",sans-serif;pointer-events:none;display:flex;align-items:center;justify-content:center}
#${OVERLAY_ID} .nlsp-shell{pointer-events:auto}
#${OVERLAY_ID} .nlsp-topbar{cursor:move;touch-action:none}
#${OVERLAY_ID} .nlsp-topbar .tr,#${OVERLAY_ID} .nlsp-topbar .tr *{cursor:default}
#${OVERLAY_ID} .nlsp-pane,#${OVERLAY_ID} .nlsp-pane *{cursor:default}
#${OVERLAY_ID} .nlsp-body,#${OVERLAY_ID} .nlsp-body *{cursor:default}
#${OVERLAY_ID} .nlsp-btn,#${OVERLAY_ID} .nlsp-app,#${OVERLAY_ID} .nlsp-close,#${OVERLAY_ID} .nlsp-icon,#${OVERLAY_ID} .nlsp-back,#${OVERLAY_ID} button{cursor:pointer}
#${OVERLAY_ID} input,#${OVERLAY_ID} textarea,#${OVERLAY_ID} select{cursor:text;pointer-events:auto!important;user-select:text!important;-webkit-user-select:text!important;-webkit-touch-callout:default!important;touch-action:manipulation!important}
#${OVERLAY_ID} input::selection,#${OVERLAY_ID} textarea::selection{background:var(--t-accent);color:var(--t-bg)}
#${OVERLAY_ID} .nlsp-api-key-wrap{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center}
#${OVERLAY_ID} .nlsp-mini-btn{min-width:54px;padding:9px 10px;margin:0;white-space:nowrap}
/** preview 原封不动照搬开始 **/
.scene,.nlsp-shell{position:relative;width:min(820px,94vw);height:min(580px,88vh);animation:hl-shift 6s ease-in-out infinite}@media(max-width:768px){.scene,.nlsp-shell{width:96vw;height:min(520px,80vh);border-radius:0}.nlsp-topbar{padding:12px 14px 10px}.nlsp-topbar .tname{font-size:11px;letter-spacing:1px}.nlsp-topbar .tsub{font-size:10px}.nlsp-body{padding:12px 14px}.nlsp-app-grid{grid-template-columns:repeat(3,1fr);gap:10px}.nlsp-app .nlsp-app-ic{width:46px;height:46px;font-size:20px}.nlsp-app .nlsp-app-name{font-size:10px}.nlsp-btn{font-size:10px;padding:6px 12px}.nlsp-card{padding:10px 12px}.nlsp-input,.nlsp-select,.nlsp-textarea{padding:8px 10px;font-size:12px}.nlsp-page-title{font-size:11px}.nlsp-pt-pill{font-size:10px;padding:3px 10px}.nlsp-chat{font-size:11px}.nlsp-msg{font-size:11px;padding:8px 10px}}
@keyframes hl-shift{0%,100%{transform:translate(0,0)}25%{transform:translate(.3px,-.2px)}50%{transform:translate(-.2px,.3px)}75%{transform:translate(.1px,-.1px)}}
.frame,.nlsp-frame{position:absolute;inset:-4px;z-index:0;pointer-events:none;border-radius:2px;background:transparent}
.frame::before,.nlsp-frame::before{content:"";position:absolute;inset:-2px;background:conic-gradient(from 0deg at 0% 0%,transparent 60%,rgba(100,210,255,.15) 60%,rgba(100,210,255,.15) 70%,transparent 70%) no-repeat 0 0/16px 16px,conic-gradient(from 90deg at 100% 0%,transparent 60%,rgba(100,210,255,.15) 60%,rgba(100,210,255,.15) 70%,transparent 70%) no-repeat 100% 0/16px 16px,conic-gradient(from 180deg at 100% 100%,transparent 60%,rgba(100,210,255,.15) 60%,rgba(100,210,255,.15) 70%,transparent 70%) no-repeat 100% 100%/16px 16px,conic-gradient(from 270deg at 0% 100%,transparent 60%,rgba(100,210,255,.15) 60%,rgba(100,210,255,.15) 70%,transparent 70%) no-repeat 0 100%/16px 16px}
.frame::after,.nlsp-frame::after{content:"";position:absolute;inset:0;border:3px solid transparent;border-image:linear-gradient(90deg,transparent 0%,rgba(80,180,255,.75) 8%,rgba(20,60,140,.9) 12%,transparent 16%,transparent 24%,rgba(60,160,240,.7) 28%,rgba(30,80,160,.85) 32%,transparent 36%,transparent 44%,rgba(80,190,255,.8) 48%,rgba(40,90,150,.95) 52%,transparent 56%,transparent 64%,rgba(50,150,230,.65) 68%,rgba(25,70,140,.8) 75%,transparent 82%,transparent 88%,rgba(70,170,245,.8) 92%,rgba(35,85,155,.9) 96%,transparent 100%) 3;animation:hl-frame-glow 3s ease-in-out infinite}
@keyframes hl-frame-glow{0%,100%{opacity:.85;filter:drop-shadow(0 0 12px rgba(80,180,255,.4)) drop-shadow(0 0 30px rgba(40,120,220,.2))}50%{opacity:1;filter:drop-shadow(0 0 18px rgba(80,180,255,.55)) drop-shadow(0 0 40px rgba(40,120,220,.3))}}
.corners,.nlsp-corners{position:absolute;inset:0;z-index:1;pointer-events:none}
.corner,.nlsp-corner{position:absolute;width:32px;height:32px;border-radius:2px;box-shadow:0 0 20px rgba(80,200,255,.35),0 0 60px rgba(40,120,220,.15),inset 0 0 10px rgba(100,210,255,.1)}
.corner::before,.corner::after,.nlsp-corner::before,.nlsp-corner::after{content:"";position:absolute;background:linear-gradient(180deg,rgba(120,220,255,.9),rgba(30,80,180,.6))}
.corner::before,.nlsp-corner::before{width:3px;height:16px}
.corner::after,.nlsp-corner::after{width:16px;height:3px}
.corner.tl,.nlsp-corner.tl{top:0;left:0}.corner.tl::before,.nlsp-corner.tl::before{top:0;left:0}.corner.tl::after,.nlsp-corner.tl::after{top:0;left:0}
.corner.tr,.nlsp-corner.tr{top:0;right:0}.corner.tr::before,.nlsp-corner.tr::before{top:0;right:0}.corner.tr::after,.nlsp-corner.tr::after{top:0;right:0}
.corner.br,.nlsp-corner.br{bottom:0;right:0}.corner.br::before,.nlsp-corner.br::before{bottom:0;right:0}.corner.br::after,.nlsp-corner.br::after{bottom:0;right:0}
.corner.bl,.nlsp-corner.bl{bottom:0;left:0}.corner.bl::before,.nlsp-corner.bl::before{bottom:0;left:0}.corner.bl::after,.nlsp-corner.bl::after{bottom:0;left:0}
.panel,.nlsp-panel{position:relative;z-index:2;width:100%;height:100%;background:radial-gradient(ellipse at 30% 20%,rgba(30,60,120,.12) 0%,transparent 55%),radial-gradient(ellipse at 70% 80%,rgba(20,50,110,.08) 0%,transparent 55%),var(--t-bg);border:1px solid var(--t-shellBorder);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 0 0 1px var(--t-w) inset,0 0 30px rgba(40,100,200,.08) inset}
.panel::before,.nlsp-panel::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:repeating-linear-gradient(25deg,transparent 0,transparent 98px,rgba(120,200,255,.03) 98px,rgba(120,200,255,.03) 100px),repeating-linear-gradient(-20deg,transparent 0,transparent 140px,rgba(80,160,240,.02) 140px,rgba(80,160,240,.02) 142px),radial-gradient(circle at 15% 30%,rgba(100,200,255,.06) 0,transparent 30%),radial-gradient(circle at 85% 70%,rgba(60,150,220,.04) 0,transparent 25%);opacity:.7}
.panel::after,.nlsp-panel::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(0deg,rgba(40,100,180,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(40,100,180,.03) 1px,transparent 1px);background-size:40px 40px;opacity:.4}
.header,.nlsp-topbar{position:relative;z-index:2;flex:0 0 auto;padding:16px 24px 14px;border-bottom:1px solid var(--t-inputBorder);display:flex;align-items:center;justify-content:space-between}
.header .title,.nlsp-topbar .tname{font-family:"Tourney",monospace;font-size:13px;font-weight:700;letter-spacing:3px;color:var(--t-title);text-shadow:0 0 12px rgba(100,180,255,.4),0 0 24px rgba(60,120,220,.2);animation:hl-text-scan 4s ease-in-out infinite}
@keyframes hl-text-scan{0%,20%,100%{text-shadow:0 0 12px rgba(100,180,255,.4),0 0 24px rgba(60,120,220,.2)}21%,30%{text-shadow:0 0 20px rgba(130,210,255,.6),0 0 36px rgba(80,150,230,.35)}}
.header .sub,.nlsp-topbar .tsub{font-size:12px;color:var(--t-muted);letter-spacing:1px}
.nlsp-topbar .tr{display:flex;align-items:center;gap:14px}
.body,.nlsp-body{position:relative;z-index:2;flex:1 1 auto;overflow:auto;padding:20px 24px}
.nlsp-pane{position:relative;z-index:2;flex:1 1 auto;overflow:auto}
.body::-webkit-scrollbar,.nlsp-body::-webkit-scrollbar,.nlsp-pane::-webkit-scrollbar{width:4px}
.body::-webkit-scrollbar-track,.nlsp-body::-webkit-scrollbar-track,.nlsp-pane::-webkit-scrollbar-track{background:transparent}
.body::-webkit-scrollbar-thumb,.nlsp-body::-webkit-scrollbar-thumb,.nlsp-pane::-webkit-scrollbar-thumb{background:rgba(40,100,180,.3);border-radius:3px}
.hl-text,.nlsp-page-sub{color:var(--t-text);font-size:13px;line-height:1.7;letter-spacing:.5px;text-shadow:0 0 6px rgba(60,140,220,.3)}
.hl-text.accent,.nlsp-task-card .tgoal,.nlsp-card .icate,.nlsp-icon,.nlsp-back,.nlsp-pt-pill,.nlsp-section-title,.nlsp-label{color:var(--t-accent);text-shadow:0 0 10px rgba(80,180,240,.5)}
.hl-text.mute,.nlsp-muted,.nlsp-card .idesc,.nlsp-task-card .tdesc,.nlsp-wb-box .wb-sum,.nlsp-close,.nlsp-app .nlsp-app-name,.nlsp-page-sub.mute{color:var(--t-muted);text-shadow:0 0 6px rgba(60,140,220,.2)}
.hl-card,.nlsp-card{background:var(--t-cardBg);border:1px solid var(--t-cardBorder);border-radius:4px;padding:14px 16px;margin:8px 0;position:relative;box-shadow:0 2px 10px rgba(0,0,0,.3),inset 0 1px 0 rgba(60,140,220,.08);transition:box-shadow .3s ease}
.hl-card:hover,.nlsp-card:hover{box-shadow:0 2px 16px rgba(40,100,200,.15),inset 0 1px 0 rgba(60,140,220,.15)}
.hl-card .seq,.nlsp-task-card .tmeta .seq{position:absolute;top:10px;right:12px;font-size:10px;color:rgba(100,180,240,.5);letter-spacing:1px}
.hl-btn,.nlsp-btn{font-family:"Tourney","Microsoft YaHei",sans-serif;display:inline-block;padding:7px 16px;margin:4px 6px 4px 0;background:linear-gradient(135deg,var(--t-btnBg),var(--t-btnBg2));border:1px solid var(--t-btnBorder);border-radius:2px;color:var(--t-btnText);font-size:12px;font-weight:600;cursor:pointer;letter-spacing:1px;text-shadow:0 0 6px rgba(80,180,240,.4);transition:all .2s ease}
.hl-btn:hover,.nlsp-btn:hover{background:linear-gradient(135deg,var(--t-btnBgH),var(--t-btnBg2H));border-color:rgba(80,180,240,.6);box-shadow:0 0 14px rgba(60,150,240,.3)}
.hl-btn.ghost,.nlsp-btn.ghost{background:transparent;border:1px solid var(--t-inputBorder);color:var(--t-muted)}
.nlsp-btn:disabled{opacity:.4;cursor:not-allowed}
.nlsp-btn:active{transform:scale(.97)}
.particles,.nlsp-particles{position:absolute;inset:-20px;z-index:0;pointer-events:none}
.particle,.nlsp-particle{position:absolute;width:2px;height:2px;background:#6ac0ff;border-radius:50%;box-shadow:0 0 4px rgba(100,200,255,.6);animation:hl-particle 8s linear infinite}
.nlsp-particle:nth-child(1),.particle:nth-child(1){top:10%;left:5%;animation-delay:0s;animation-duration:7s}
.nlsp-particle:nth-child(2),.particle:nth-child(2){top:25%;left:95%;animation-delay:2s;animation-duration:9s}
.nlsp-particle:nth-child(3),.particle:nth-child(3){top:60%;left:3%;animation-delay:4s;animation-duration:6s}
.nlsp-particle:nth-child(4),.particle:nth-child(4){top:80%;left:90%;animation-delay:1s;animation-duration:8s}
.nlsp-particle:nth-child(5),.particle:nth-child(5){top:45%;left:50%;animation-delay:3s;animation-duration:10s}
.nlsp-particle:nth-child(6),.particle:nth-child(6){top:15%;left:40%;animation-delay:5s;animation-duration:7.5s}
.nlsp-particle:nth-child(7),.particle:nth-child(7){top:70%;left:20%;animation-delay:6s;animation-duration:8.5s}
.nlsp-particle:nth-child(8),.particle:nth-child(8){top:35%;left:75%;animation-delay:2.5s;animation-duration:9.5s}
@keyframes hl-particle{0%{transform:translate(0,0);opacity:0}20%{opacity:.8}80%{opacity:.3}100%{transform:translate(-10px,-40px);opacity:0}}
.vignette,.nlsp-vignette{position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(ellipse at center,transparent 50%,var(--t-vignette) 100%)}
.chromatic{position:absolute;inset:0;z-index:0;pointer-events:none;background:transparent;box-shadow:1px 0 0 rgba(255,60,60,.015),-1px 0 0 rgba(60,180,255,.015),2px 0 0 rgba(255,60,60,.008),-2px 0 0 rgba(60,180,255,.008)}
.tag,.nlsp-card .icate{display:inline-block;font-size:10px;padding:2px 8px;margin:0 4px;background:rgba(20,60,130,.35);border:1px solid rgba(60,150,240,.2);color:rgba(140,200,240,.8);letter-spacing:1px}
/** preview 照搬结束 **/
.nlsp-row{margin:10px 0}
.nlsp-label{font-family:"Tourney",monospace;display:block;font-size:11px;font-weight:600;letter-spacing:1.5px;margin:0 0 6px;text-transform:uppercase;text-shadow:0 0 6px rgba(80,180,240,.4)}
.nlsp-input,.nlsp-select,.nlsp-textarea{width:100%;box-sizing:border-box;padding:10px 14px;background:var(--t-inputBg);border:1px solid var(--t-inputBorder);border-radius:2px;color:var(--t-text);font-size:13px;outline:none;font-family:inherit;letter-spacing:.5px;transition:all .2s ease}
.nlsp-textarea{resize:vertical;min-height:56px;line-height:1.6}
.nlsp-input:focus,.nlsp-select:focus,.nlsp-textarea:focus{border-color:var(--t-accent);box-shadow:0 0 0 3px rgba(80,180,240,.12);background:var(--t-cardBg)}
.nlsp-input::placeholder,.nlsp-textarea::placeholder{color:var(--t-muted)}
.nlsp-card .iname{font-size:14px;font-weight:700;color:var(--t-title);letter-spacing:.5px;text-shadow:0 0 8px rgba(100,180,255,.3)}
.nlsp-card .idesc{font-size:12px;line-height:1.55;text-shadow:none}
.nlsp-card .ibot{display:flex;justify-content:space-between;align-items:center;margin-top:4px;gap:8px}
.nlsp-card .icate{background:rgba(20,60,130,.35);border:1px solid rgba(60,150,240,.2);padding:2px 8px;border-radius:1px;font-size:10px;width:fit-content}
.nlsp-pt{color:var(--t-warn);font-weight:700;text-shadow:0 0 6px rgba(200,160,80,.4)}
.nlsp-pt-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:2px;font-size:12px;font-weight:600;letter-spacing:1px;background:rgba(20,60,130,.35);border:1px solid rgba(60,150,240,.2)}
.nlsp-icon{cursor:pointer;font-size:18px;line-height:1;user-select:none;transition:color .2s ease}
.nlsp-icon:hover{color:var(--t-title)}
.nlsp-close{cursor:pointer;font-size:20px;line-height:1;transition:color .2s ease}
.nlsp-close:hover{color:var(--t-title)}
.nlsp-grid3{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.nlsp-page-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.nlsp-page-title{font-family:"Tourney",monospace;font-size:12px;font-weight:700;letter-spacing:1.5px;color:var(--t-title);text-shadow:0 0 8px rgba(100,180,255,.25)}
.nlsp-section-title{font-family:"Tourney",monospace;display:block;font-size:11px;font-weight:600;letter-spacing:2px;margin:8px 2px 6px;text-transform:uppercase}
.nlsp-task-card{padding:14px 16px}
.nlsp-task-card .tmeta{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.nlsp-task-card .tmeta .seq{position:static;padding:2px 8px;background:rgba(20,60,130,.35);border:1px solid rgba(60,150,240,.2);border-radius:1px}
.nlsp-task-card .tmeta .status-doing{color:var(--t-warn);font-size:10px;font-weight:600;letter-spacing:1px}
.nlsp-task-card .tmeta .status-done{color:var(--t-success);font-size:10px;font-weight:600;letter-spacing:1px}
.nlsp-task-card .tgoal{display:block;margin-top:6px}
.nlsp-task-card .treward{display:block;margin-top:4px;color:var(--t-warn);font-size:12px;font-weight:600}
.nlsp-task-card .tactions{display:flex;gap:8px;margin-top:8px}
.nlsp-rarity{font-size:10px;padding:2px 8px;border-radius:1px;border:1px solid;font-weight:600;letter-spacing:1px}
.nlsp-r-普通{color:var(--t-muted);border-color:var(--t-muted)}.nlsp-r-稀有{color:var(--t-accent);border-color:var(--t-accent)}.nlsp-r-史诗{color:var(--t-pur);border-color:var(--t-pur)}.nlsp-r-传说{color:var(--t-warn);border-color:var(--t-warn)}.nlsp-r-神话{color:var(--t-err);border-color:var(--t-err)}
.nlsp-muted{font-size:12px;text-align:center;padding:24px 0;letter-spacing:.5px}
.nlsp-loading{color:var(--t-accent);font-size:12px;text-align:center;padding:24px 0;letter-spacing:1px;text-shadow:0 0 6px rgba(80,180,240,.3)}
.nlsp-center{text-align:center;padding:20px 10px}
.nlsp-tags{display:flex;gap:6px;flex-wrap:wrap}
.nlsp-result{background:var(--t-cardBg);border:1px solid var(--t-cardBorder);border-radius:4px;padding:12px 14px;margin:8px 0}
.nlsp-banner{margin:4px 0 14px;padding:12px 14px;border-radius:4px;background:linear-gradient(135deg,rgba(30,60,130,.08),transparent);border:1px solid rgba(40,100,200,.15);color:var(--t-text);font-size:12px;line-height:1.65;letter-spacing:.3px}
.nlsp-banner .greet{color:var(--t-title);margin-top:6px;text-shadow:0 0 6px rgba(100,180,255,.2)}
.nlsp-wb-box{margin-top:4px;padding:10px 12px;border-radius:2px;background:rgba(8,18,35,.6);border:1px solid var(--t-cardBorder);color:var(--t-text);font-size:12px}
.nlsp-wb-box .wb-name{color:var(--t-title);font-weight:600}
.nlsp-wb-box .wb-sum{margin-top:4px;line-height:1.55;white-space:pre-wrap;max-height:140px;overflow:auto;font-size:11px}
.nlsp-back{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:500;letter-spacing:.5px;cursor:pointer;transition:opacity .2s ease}
.nlsp-back:hover{opacity:.7}
.nlsp-chat{flex:1 1 auto;display:flex;flex-direction:column;overflow:auto;padding:8px 4px;gap:8px}
.nlsp-chat::-webkit-scrollbar{width:4px}.nlsp-chat::-webkit-scrollbar-track{background:transparent}.nlsp-chat::-webkit-scrollbar-thumb{background:rgba(40,100,180,.2);border-radius:2px}
.nlsp-msg{max-width:80%;padding:10px 14px;border-radius:4px;font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word;letter-spacing:.3px}
.nlsp-msg.user{align-self:flex-end;background:var(--t-msgUser);border:1px solid var(--t-btnBorder);color:var(--t-title);text-shadow:0 0 3px rgba(80,180,240,.1)}
.nlsp-msg.ai{align-self:flex-start;background:var(--t-msgAi);border:1px solid var(--t-cardBorder);color:var(--t-text)}
.nlsp-msg .meta{font-size:10px;color:var(--t-muted);margin-bottom:3px;font-weight:600;letter-spacing:1px}
.nlsp-input-bar{flex:0 0 auto;display:flex;gap:6px;padding:8px 4px 4px;border-top:1px solid rgba(40,100,180,.25)}.nlsp-input-bar input{flex:1}
.nlsp-p-empty{align-self:center;margin:auto;font-size:12px;letter-spacing:.5px}
.nlsp-app-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:2px 0}
.nlsp-app{cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none;transition:transform .2s ease}
.nlsp-app:hover{transform:translateY(-2px)}
.nlsp-app .nlsp-app-ic{width:58px;height:58px;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--t-title);background:linear-gradient(150deg,rgba(30,80,160,.4),rgba(40,110,220,.24));border:1px solid var(--t-cardBorder);box-shadow:0 2px 8px rgba(0,0,0,.2),inset 0 1px 0 rgba(60,140,220,.08);transition:box-shadow .2s ease,border-color .2s ease}
.nlsp-app:hover .nlsp-app-ic{box-shadow:0 0 14px rgba(80,180,255,.25),inset 0 1px 0 rgba(60,140,220,.15);border-color:rgba(60,150,240,.44)}
.nlsp-mine-cell{background:var(--t-cardBg);border:1px solid var(--t-cardBorder);font-family:"Tourney","Microsoft YaHei",sans-serif;color:var(--t-text);user-select:none}
.nlsp-mine-open{background:rgba(8,18,35,.7)}.nlsp-mine-closed:hover{background:rgba(20,60,130,.3)}.nlsp-mine-boom{background:rgba(240,60,80,.2)}
.nlsp-flow{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}
.nlsp-flow::after{content:"";position:absolute;top:-150%;left:-150%;width:300%;height:300%;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.04) 45%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 55%,transparent 60%);animation:nlsp-flow-sweep 5s ease-in-out infinite}
@keyframes nlsp-flow-sweep{0%{transform:translate(-30%,-30%) rotate(15deg)}50%{transform:translate(30%,30%) rotate(15deg)}100%{transform:translate(-30%,-30%) rotate(15deg)}}

/* ===== 全息科幻 ===== */
.theme-scifi .nlsp-shell{border:1px solid rgba(100,200,255,.35)!important;box-shadow:0 0 25px rgba(100,200,255,.12),0 0 80px rgba(100,200,255,.05),inset 0 0 40px rgba(100,200,255,.06)!important;border-radius:14px!important;backdrop-filter:blur(14px) saturate(1.3)!important;background:rgba(8,16,32,.72)!important}
.theme-scifi .nlsp-frame{border:2px solid transparent!important;background:linear-gradient(90deg,transparent 20%,rgba(100,200,255,.5) 50%,transparent 80%) no-repeat 0 0/100% 2px,linear-gradient(0deg,transparent 20%,rgba(100,200,255,.5) 50%,transparent 80%) no-repeat 0 0/2px 100%!important;border-radius:16px!important;animation:scifi-scan 4s linear infinite!important}
.theme-scifi .nlsp-corners .nlsp-corner{border-color:rgba(100,200,255,.7)!important;box-shadow:0 0 12px rgba(100,200,255,.4)!important}
.theme-scifi .nlsp-particles .nlsp-particle{background:#5cd6ff!important;box-shadow:0 0 8px rgba(92,214,255,.9),0 0 20px rgba(92,214,255,.4)!important}
.theme-scifi .nlsp-panel{background:transparent!important;border:none!important;box-shadow:none!important}
.theme-scifi .nlsp-panel::before{background:repeating-linear-gradient(0deg,transparent 0,transparent 3px,rgba(100,200,255,.02) 3px,rgba(100,200,255,.02) 4px)!important}
.theme-scifi .nlsp-topbar{border-bottom:1px solid rgba(100,200,255,.25)!important;text-shadow:0 0 10px rgba(100,200,255,.5),2px 0 0 rgba(255,0,60,.3),-2px 0 0 rgba(0,200,255,.3)!important}
.theme-scifi .nlsp-topbar .tname{color:#a0e0ff!important;text-shadow:0 0 12px rgba(100,200,255,.6),1px 0 0 rgba(255,60,60,.2),-1px 0 0 rgba(60,200,255,.2)!important;letter-spacing:4px!important}
.theme-scifi .nlsp-vignette{background:radial-gradient(ellipse at center,transparent 60%,rgba(20,40,80,.3) 100%)!important}
.theme-scifi .nlsp-flow::after{background:linear-gradient(105deg,transparent 40%,rgba(100,200,255,.06) 45%,rgba(100,200,255,.12) 50%,rgba(100,200,255,.06) 55%,transparent 60%)!important;animation:scifi-sweep 4s ease-in-out infinite!important}
@keyframes scifi-scan{0%{background-position:-100% 0,0 -100%}100%{background-position:200% 0,0 200%}}
@keyframes scifi-sweep{0%{transform:translate(-30%,-30%) rotate(15deg)}50%{transform:translate(30%,30%) rotate(15deg)}100%{transform:translate(-30%,-30%) rotate(15deg)}}
/* ===== 国风水墨 ===== */
.theme-xianxia .nlsp-shell{border:1px solid rgba(190,160,90,.4)!important;box-shadow:0 0 30px rgba(190,160,90,.08),0 0 90px rgba(190,160,90,.04),inset 0 0 50px rgba(190,160,90,.04)!important;border-radius:3px!important;background:rgba(14,10,8,.88)!important;backdrop-filter:blur(6px)!important}
.theme-xianxia .nlsp-frame{border:1px solid rgba(190,160,90,.25)!important;background:linear-gradient(90deg,transparent 30%,rgba(100,200,180,.15) 50%,transparent 70%) no-repeat 0 0/100% 1px!important;border-radius:5px!important;animation:xianxia-mist 8s ease-in-out infinite!important}
.theme-xianxia .nlsp-frame::before{content:"";position:absolute;inset:-2px;background:radial-gradient(circle at 20% 50%,rgba(100,200,180,.08) 0,transparent 50%),radial-gradient(circle at 80% 50%,rgba(100,200,180,.06) 0,transparent 50%)!important;animation:xianxia-flow 6s ease-in-out infinite alternate!important}
.theme-xianxia .nlsp-corners .nlsp-corner{border-color:rgba(190,160,90,.6)!important;width:24px!important;height:24px!important;background:radial-gradient(circle,rgba(190,160,90,.2),transparent)!important;border-radius:50%!important}
.theme-xianxia .nlsp-corners .nlsp-corner::before,.theme-xianxia .nlsp-corners .nlsp-corner::after{background:linear-gradient(180deg,rgba(190,160,90,.6),rgba(120,90,40,.3))!important}
.theme-xianxia .nlsp-particles .nlsp-particle{background:#80d0c0!important;box-shadow:0 0 6px rgba(128,208,192,.7),0 0 15px rgba(128,208,192,.3)!important}
.theme-xianxia .nlsp-panel{background:rgba(18,14,10,.7)!important;border:1px solid rgba(190,160,90,.12)!important;box-shadow:inset 0 0 30px rgba(0,0,0,.3)!important}
.theme-xianxia .nlsp-panel::before{background:repeating-linear-gradient(45deg,transparent 0,transparent 10px,rgba(190,160,90,.015) 10px,rgba(190,160,90,.015) 20px),repeating-linear-gradient(-45deg,transparent 0,transparent 15px,rgba(190,160,90,.01) 15px,rgba(190,160,90,.01) 30px)!important}
.theme-xianxia .nlsp-topbar{border-bottom:1px solid rgba(190,160,90,.2)!important}
.theme-xianxia .nlsp-topbar .tname{color:#d0b870!important;text-shadow:0 0 8px rgba(190,160,90,.4),0 0 20px rgba(190,160,90,.15)!important;letter-spacing:3px!important}
.theme-xianxia .nlsp-vignette{background:radial-gradient(ellipse at center,transparent 55%,rgba(30,20,10,.4) 100%)!important}
.theme-xianxia .nlsp-flow::after{background:linear-gradient(120deg,transparent 30%,rgba(100,200,180,.05) 45%,rgba(100,200,180,.1) 50%,rgba(100,200,180,.05) 55%,transparent 70%)!important;animation:xianxia-sweep 8s ease-in-out infinite!important}
@keyframes xianxia-mist{0%,100%{opacity:.6;filter:blur(0px)}50%{opacity:1;filter:blur(1px)}}
@keyframes xianxia-flow{0%{transform:translateX(-10%)}100%{transform:translateX(10%)}}
@keyframes xianxia-sweep{0%{transform:translate(-20%,-20%)}50%{transform:translate(20%,20%)}100%{transform:translate(-20%,-20%)}}
/* ===== 暗黑硬核 ===== */
.theme-solo .nlsp-shell{border:2px solid rgba(170,180,195,.45)!important;box-shadow:0 0 20px rgba(170,180,195,.08),inset 0 0 30px rgba(0,0,0,.4)!important;border-radius:0!important;background:rgba(10,10,14,.96)!important;clip-path:polygon(0 16px,16px 0,calc(100% - 16px) 0,100% 16px,100% calc(100% - 16px),calc(100% - 16px) 100%,16px 100%,0 calc(100% - 16px))!important}
.theme-solo .nlsp-corners{display:none!important}
.theme-solo .nlsp-frame{display:none!important}
.theme-solo .nlsp-particles{display:none!important}
.theme-solo .nlsp-flow{display:none!important}
.theme-solo .nlsp-vignette{display:none!important}
.theme-solo .nlsp-panel{background:rgba(14,14,18,.9)!important;border:1px solid rgba(170,180,195,.12)!important;box-shadow:inset 0 1px 0 rgba(170,180,195,.08)!important}
.theme-solo .nlsp-panel::before{background:repeating-linear-gradient(0deg,transparent 0,transparent 4px,rgba(170,180,195,.015) 4px,rgba(170,180,195,.015) 5px)!important}
.theme-solo .nlsp-topbar{border-bottom:1px solid rgba(170,180,195,.18)!important;background:linear-gradient(90deg,transparent,rgba(170,180,195,.03),transparent)!important}
.theme-solo .nlsp-topbar .tname{color:#a0a8b8!important;text-shadow:0 0 6px rgba(170,180,195,.3)!important;letter-spacing:2px!important}
.theme-solo .nlsp-card{border:1px solid rgba(170,180,195,.15)!important;box-shadow:0 2px 8px rgba(0,0,0,.4)!important}
.theme-solo .nlsp-btn{border:1px solid rgba(170,180,195,.3)!important;box-shadow:0 2px 6px rgba(0,0,0,.3)!important}
/* ===== 赛博霓虹 ===== */
.theme-neon .nlsp-shell{border:1px solid rgba(255,42,138,.45)!important;box-shadow:0 0 25px rgba(255,42,138,.15),0 0 70px rgba(0,255,230,.08),inset 0 0 40px rgba(255,42,138,.06)!important;border-radius:4px!important;background:rgba(6,6,12,.92)!important;backdrop-filter:blur(8px)!important}
.theme-neon .nlsp-frame{border:1px solid transparent!important;background:linear-gradient(90deg,rgba(255,42,138,.4),rgba(0,255,230,.4),rgba(255,42,138,.4)) no-repeat 0 0/100% 1px,linear-gradient(0deg,rgba(255,42,138,.4),rgba(0,255,230,.4),rgba(255,42,138,.4)) no-repeat 0 0/1px 100%!important;border-radius:5px!important;animation:neon-glitch 3s linear infinite!important}
.theme-neon .nlsp-frame::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0,transparent 2px,rgba(0,255,230,.02) 2px,rgba(0,255,230,.02) 3px),repeating-linear-gradient(90deg,transparent 0,transparent 2px,rgba(255,42,138,.02) 2px,rgba(255,42,138,.02) 3px)!important;animation:neon-circuit 4s linear infinite!important}
.theme-neon .nlsp-corners .nlsp-corner{border-color:rgba(255,42,138,.6)!important;box-shadow:0 0 10px rgba(255,42,138,.4),0 0 20px rgba(0,255,230,.15)!important}
.theme-neon .nlsp-particles .nlsp-particle{background:#ff2a8a!important;box-shadow:0 0 8px rgba(255,42,138,.9),0 0 18px rgba(0,255,230,.3)!important}
.theme-neon .nlsp-particles .nlsp-particle:nth-child(even){background:#00ffe8!important;box-shadow:0 0 8px rgba(0,255,230,.9),0 0 18px rgba(255,42,138,.3)!important}
.theme-neon .nlsp-panel{background:rgba(8,8,14,.75)!important;border:1px solid rgba(0,255,230,.12)!important}
.theme-neon .nlsp-panel::before{background:repeating-linear-gradient(0deg,transparent 0,transparent 2px,rgba(0,255,230,.02) 2px,rgba(0,255,230,.02) 3px)!important}
.theme-neon .nlsp-topbar{border-bottom:1px solid rgba(255,42,138,.25)!important;background:linear-gradient(90deg,rgba(255,42,138,.03),rgba(0,255,230,.03))!important}
.theme-neon .nlsp-topbar .tname{color:#ff2a8a!important;text-shadow:0 0 10px rgba(255,42,138,.5),0 0 25px rgba(0,255,230,.2)!important;animation:neon-text 4s ease-in-out infinite!important}
.theme-neon .nlsp-vignette{background:radial-gradient(ellipse at center,transparent 50%,rgba(20,0,20,.5) 100%)!important}
.theme-neon .nlsp-flow::after{background:linear-gradient(105deg,transparent 40%,rgba(255,42,138,.06) 45%,rgba(0,255,230,.08) 50%,rgba(255,42,138,.06) 55%,transparent 60%)!important;animation:neon-sweep 3s ease-in-out infinite!important}
@keyframes neon-glitch{0%,90%{opacity:1}92%{opacity:.3}94%{opacity:1}96%{opacity:.5}98%{opacity:1}}
@keyframes neon-circuit{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}
@keyframes neon-text{0%,85%{transform:translate(0)}88%{transform:translate(-1px,1px)}90%{transform:translate(1px,-1px)}92%{transform:translate(0)}}
@keyframes neon-sweep{0%{transform:translate(-30%,-30%) rotate(15deg)}50%{transform:translate(30%,30%) rotate(15deg)}100%{transform:translate(-30%,-30%) rotate(15deg)}}

/* 用户设置：字体缩放与移动端输入适配 */
#${OVERLAY_ID}{font-size:calc(14px * var(--nlsp-font-scale))}#${OVERLAY_ID} .nlsp-page-sub{font-size:calc(13px * var(--nlsp-font-scale))}#${OVERLAY_ID} .nlsp-label,#${OVERLAY_ID} .nlsp-section-title{font-size:calc(11px * var(--nlsp-font-scale))}#${OVERLAY_ID} .nlsp-input,#${OVERLAY_ID} .nlsp-select,#${OVERLAY_ID} .nlsp-textarea{font-size:calc(13px * var(--nlsp-font-scale))}#${OVERLAY_ID} .nlsp-btn{font-size:calc(12px * var(--nlsp-font-scale))}
@media(max-width:720px){#${OVERLAY_ID} .nlsp-shell{width:96vw!important;height:88vh!important;max-height:88vh}.nlsp-api-key-wrap{grid-template-columns:minmax(0,1fr) auto!important}.nlsp-api-key-wrap .nlsp-key-toggle{display:none}}
`;
        const style = doc.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        doc.head.appendChild(style);
    }

    function getDoc() {
        try {
            if (window.parent && window.parent.document && window.parent.document.body) return window.parent.document;
        } catch (e) {}
        return document;
    }


    var frameHTML = '<div class="nlsp-frame"></div><div class="nlsp-corners"><div class="nlsp-corner tl"></div><div class="nlsp-corner tr"></div><div class="nlsp-corner br"></div><div class="nlsp-corner bl"></div></div><div class="nlsp-particles"><span class="nlsp-particle"></span><span class="nlsp-particle"></span><span class="nlsp-particle"></span><span class="nlsp-particle"></span><span class="nlsp-particle"></span><span class="nlsp-particle"></span><span class="nlsp-particle"></span><span class="nlsp-particle"></span></div><div class="nlsp-panel"><div class="nlsp-flow"></div>';

    function openPanel() {
        const doc = getDoc();
        let overlay = doc.getElementById(OVERLAY_ID);
        if (overlay) { overlay.remove(); return; }
        const liveUser = getUserBinding();
        if (!state.userBinding || state.userBinding.id !== liveUser.id) {
            state = loadState();
            applyTheme(state.theme || 'hl-dark');
        }
        ensureStyle();
        overlay = doc.createElement('div');
        
        overlay.id = OVERLAY_ID;
        overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });
        var container = doc.getElementById('movingDivs') || doc.getElementById('sheld') || doc.body;
        container.appendChild(overlay);
        render();
    }

    function closePanel() {
        const o = getDoc().getElementById(OVERLAY_ID);
        if (o) o.remove();
    }

    function overlay() { return getDoc().getElementById(OVERLAY_ID); }

    function setShell(inner) {
        const o = overlay();
        if (!o) return null;
        o.innerHTML = `<div class="nlsp-shell theme-${(state.theme||'hl-dark').replace('hl-','')}">${frameHTML}${inner}</div><div class="nlsp-vignette"></div></div>`;
        const shell = o.querySelector('.nlsp-shell');
        if (shell) {
            shell.style.setProperty('--nlsp-font-scale', String(state.fontScale || 1));
            applyPanelResize(shell);
            makeWindowDraggable(shell, o);
        }
        return shell;
    }

    function applyPanelResize(shell) {
        if (!shell) shell = getDoc().querySelector('.nlsp-shell');
        if (!shell) return;
        var doc = getDoc();
        var vw = doc.documentElement.clientWidth || window.innerWidth;
        var vh = doc.documentElement.clientHeight || window.innerHeight;
        var preset = PANEL_PRESETS[state.layoutPreset] || PANEL_PRESETS['wide-16-9'];
        var wantedW = state.panelW > 200 ? state.panelW : preset.width;
        var wantedH = state.panelH > 150 ? state.panelH : preset.height;
        shell.style.width = Math.max(320, Math.min(wantedW, vw - 20)) + 'px';
        shell.style.height = Math.max(240, Math.min(wantedH, vh - 20)) + 'px';
        shell.style.maxWidth = 'calc(100vw - 20px)';
        shell.style.maxHeight = 'calc(100vh - 20px)';
        shell.style.setProperty('--nlsp-font-scale', String(state.fontScale || 1));
        if (!state.scaleLocked) {
            shell.style.resize = 'both';
            shell.style.overflow = 'hidden';
            shell.style.minWidth = '320px';
            shell.style.minHeight = '240px';
        }
        if (!shell._nlspResizeBound) {
            shell._nlspResizeBound = true;
            var saveTimer = null;
            var ResizeObserverCtor = (doc.defaultView && doc.defaultView.ResizeObserver) || window.ResizeObserver;
            if (typeof ResizeObserverCtor === 'function') {
                var ro = new ResizeObserverCtor(function(){
                    var r = shell.getBoundingClientRect();
                    state.panelW = Math.round(r.width);
                    state.panelH = Math.round(r.height);
                    if (saveTimer) clearTimeout(saveTimer);
                    saveTimer = setTimeout(function(){ saveState(); }, 500);
                });
                ro.observe(shell);
            }
            shell.addEventListener('mouseup', function(){ saveState(); });
            shell.addEventListener('touchend', function(){ saveState(); });
        }
    }

    function makeWindowDraggable(shell, win) {
        const doc = getDoc();
        const topbar = shell.querySelector('.nlsp-topbar');
        console.log('[自定义系统] makeWindowDraggable: doc='+(doc===document?'self':'parent')+' topbar='+(topbar?'OK':'NULL')+' win='+win.tagName);
        if (!topbar) return;
        topbar.style.touchAction = 'none';
        let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
        function isIgnored(t) {
            return !!(t && (t.closest('.tr') || t.closest('.nlsp-close') || t.closest('.nlsp-icon') || t.tagName === 'BUTTON'));
        }
        function startDrag(cx, cy) {
            dragging = true;
            sx = cx; sy = cy;
            const r = win.getBoundingClientRect();
            ox = r.left; oy = r.top;
            win.style.left = ox + 'px'; win.style.top = oy + 'px';
            win.style.right = 'auto'; win.style.bottom = 'auto';
            topbar.style.background = 'var(--t-accent)';
            console.log('[自定义系统] drag start cx='+cx+' cy='+cy+' rect='+r.width+'x'+r.height);
        }
        function moveDrag(cx, cy) {
            if (!dragging) return;
            const dx = cx - sx, dy = cy - sy;
            const W = doc.documentElement.clientWidth, H = window.parent ? window.parent.innerHeight : doc.documentElement.clientHeight;
            let x = ox + dx, y = oy + dy;
            x = Math.max(4, Math.min(x, W - shell.offsetWidth - 4));
            y = Math.max(4, Math.min(y, H - shell.offsetHeight - 4));
            win.style.left = x + 'px'; win.style.top = y + 'px';
        }
        function endDrag() {
            if (dragging) console.log('[自定义系统] drag end');
            dragging = false;
            topbar.style.background = '';
        }
        topbar.addEventListener('pointerdown', function(e) {
            console.log('[自定义系统] pointerdown target='+e.target.tagName+' ignored='+isIgnored(e.target));
            if (isIgnored(e.target)) return;
            startDrag(e.clientX, e.clientY);
            e.preventDefault();
        }, { passive: false });
        doc.addEventListener('pointermove', function(e) {
            if (!dragging) return;
            moveDrag(e.clientX, e.clientY);
            e.preventDefault();
        }, { passive: false });
        doc.addEventListener('pointerup', endDrag);
        doc.addEventListener('pointercancel', endDrag);
        topbar.addEventListener('touchstart', function(e) {
            console.log('[自定义系统] touchstart target='+e.target.tagName+' touches='+e.touches.length);
            if (dragging) return;
            if (isIgnored(e.target)) return;
            var t = e.touches[0];
            startDrag(t.clientX, t.clientY);
            e.preventDefault();
        }, { passive: false });
        doc.addEventListener('touchmove', function(e) {
            if (!dragging) return;
            var t = e.touches[0];
            moveDrag(t.clientX, t.clientY);
            e.preventDefault();
        }, { passive: false });
        doc.addEventListener('touchend', endDrag);
        doc.addEventListener('touchcancel', endDrag);
    }

    function shellTopBar(title, sub, right) {
        return `<div class="nlsp-topbar">
            <div class="tl"><span class="badge"></span><div><div class="tname">${escapeText(title || '系统面板')}</div><div class="tsub">${escapeText(sub || '')}</div></div></div>
            <div class="tr">${right || ''}</div>
        </div>`;
    }

    function render() {
        if (!state.enabled) return renderEnable();
        if (!state.connected) return renderApi();
        if (!state.initialized) return renderInit();
        return renderMain();
    }

    /* ---------- 第一步：是否开启系统 ---------- */
    function renderEnable() {
        setShell(`
            ${shellTopBar('系统面板', '第一步 · 是否开启系统？', '<span class="nlsp-close" data-act="close">×</span>')}
            <div class="nlsp-body">
                <div class="nlsp-pane nlsp-center">
                    <p class="nlsp-page-sub">开启后将引导你接入 OpenAI 兼容接口并初始化一个可交互的“系统”。</p>
                    <div style="margin-top:16px; display:flex; gap:10px; justify-content:center;">
                        <button class="nlsp-btn ghost" data-act="close">否</button>
                        <button class="nlsp-btn" data-act="enable-yes">是</button>
                    </div>
                </div>
            </div>
        `);
        bind('close', closePanel);
        bind('enable-yes', () => { state.enabled = true; saveState(); render(); });
    }

    /* ---------- 第二步：接入 API ---------- */
    function renderApi() {
        const presetSel = presetByUrl(state.api.url);
        setShell(`
            ${shellTopBar('接入 API', '第二步 · OpenAI 兼容接口', '<span class="nlsp-close" data-act="close">×</span>')}
            <div class="nlsp-body">
                <div class="nlsp-pane">
                    <div class="nlsp-row">
                        <label class="nlsp-label">接口来源（官方预设或自定义）</label>
                        <select id="nlsp-api-preset" class="nlsp-select">
                            <option value="">自定义</option>
                            ${API_PRESETS.map((p) => `<option value="${escapeAttr(p.id)}" ${presetSel && presetSel.id === p.id ? 'selected' : ''}>${escapeText(p.name)} · ${escapeText(p.url)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="nlsp-row">
                        <label class="nlsp-label">Base URL（含 /v1，可手动改）</label>
                        <input id="nlsp-api-url" class="nlsp-input" placeholder="https://your.api/v1" value="${escapeAttr(state.api.url)}" />
                        <div id="nlsp-api-preset-hint" class="nlsp-page-sub" style="margin-top:4px;">${presetSel ? '已选官方预设：' + escapeText(presetSel.hint) : ''}</div>
                    </div>
                    <div class="nlsp-row">
                        <label class="nlsp-label">API Key</label>
                        <div class="nlsp-api-key-wrap">
                            <input id="nlsp-api-key" class="nlsp-input" type="password" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="sk-..." value="${escapeAttr(state.api.key)}" />
                            <button type="button" class="nlsp-btn ghost nlsp-mini-btn" id="nlsp-api-paste">粘贴</button>
                            <button type="button" class="nlsp-btn ghost nlsp-mini-btn nlsp-key-toggle" id="nlsp-api-key-toggle">显示</button>
                        </div>
                        <div class="nlsp-page-sub" style="margin-top:5px;">移动端可长按输入框粘贴，也可点击右侧“粘贴”。</div>
                    </div>
                    <div class="nlsp-row">
                        <label class="nlsp-label">模型</label>
                        <select id="nlsp-api-model" class="nlsp-select">
                            ${state.api.models.map((m) => `<option value="${escapeAttr(m)}" ${m === state.api.model ? 'selected' : ''}>${escapeText(m)}</option>`).join('') || '<option value="">请先拉取模型</option>'}
                        </select>
                    </div>
                    <div class="nlsp-row">
                        <label class="nlsp-label">最大输出字符数（max_tokens）</label>
                        <input id="nlsp-api-maxtokens" class="nlsp-input" type="number" min="100" max="128000" value="${state.api.maxTokens||30000}" placeholder="30000" />
                        <div class="nlsp-page-sub" style="margin-top:4px;">限制AI每次回复的最大字符数，影响所有生成（任务/商城/抽奖/对话）</div>
                    </div>
                    <div style="display:flex; gap:10px; margin-top:8px;">
                        <button class="nlsp-btn ghost" id="nlsp-pull-btn">拉取模型</button>
                        ${state.api.models.length ? '<button class="nlsp-btn" id="nlsp-next-btn">下一步</button>' : ''}
                    </div>
                    <div id="nlsp-api-status" class="nlsp-page-sub" style="margin-top:10px;"></div>
                </div>
            </div>
        `);
        bind('close', closePanel);
        const setStatus = (msg, type) => {
            const el = getDoc().getElementById('nlsp-api-status');
            if (!el) return;
            el.textContent = msg;
            el.style.color = type === 'error' ? '#ff8a8a' : (type === 'ok' ? '#9dffb0' : '');
        };
        on('nlsp-api-preset', 'change', () => {
            const sel = getDoc().getElementById('nlsp-api-preset');
            const id = sel ? sel.value : '';
            const input = getDoc().getElementById('nlsp-api-url');
            const hint = getDoc().getElementById('nlsp-api-preset-hint');
            if (id) {
                const p = API_PRESETS.find((x) => x.id === id);
                if (p && input) input.value = p.url;
                if (hint) hint.textContent = p ? '已选官方预设：' + p.hint : '';
            } else {
                if (hint) hint.textContent = '自定义：可在下方手动填入 Base URL';
            }
        });
        on('nlsp-api-key-toggle', 'click', () => {
            const input = getDoc().getElementById('nlsp-api-key');
            const btn = getDoc().getElementById('nlsp-api-key-toggle');
            if (!input) return;
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            if (btn) btn.textContent = showing ? '显示' : '隐藏';
            input.focus();
        });
        const apiKeyInput = getDoc().getElementById('nlsp-api-key');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('pointerdown', (event) => event.stopPropagation());
            apiKeyInput.addEventListener('touchstart', (event) => event.stopPropagation(), { passive: true });
            apiKeyInput.addEventListener('paste', (event) => {
                const pasted = event.clipboardData && event.clipboardData.getData('text');
                if (!pasted) return;
                event.preventDefault();
                const start = typeof apiKeyInput.selectionStart === 'number' ? apiKeyInput.selectionStart : apiKeyInput.value.length;
                const end = typeof apiKeyInput.selectionEnd === 'number' ? apiKeyInput.selectionEnd : start;
                apiKeyInput.value = apiKeyInput.value.slice(0, start) + pasted + apiKeyInput.value.slice(end);
                apiKeyInput.selectionStart = apiKeyInput.selectionEnd = start + pasted.length;
                apiKeyInput.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }
        on('nlsp-api-paste', 'click', async () => {
            const input = getDoc().getElementById('nlsp-api-key');
            if (!input) return;
            try {
                const nav = (getDoc().defaultView && getDoc().defaultView.navigator) || navigator;
                if (!nav.clipboard || typeof nav.clipboard.readText !== 'function') throw new Error('浏览器未开放剪贴板读取');
                const text = await nav.clipboard.readText();
                if (!text) throw new Error('剪贴板为空');
                input.value = String(text).trim();
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.focus();
                setStatus('API Key 已从剪贴板粘贴。', 'ok');
            } catch (e) {
                recordDebugError('移动端粘贴', e);
                input.type = 'text';
                input.focus();
                input.select();
                setStatus('无法自动读取剪贴板：请长按已选中的输入框并选择“粘贴”。', 'error');
            }
        });
        on('nlsp-pull-btn', 'click', async () => {
            const url = val(getDoc().getElementById('nlsp-api-url'));
            const key = val(getDoc().getElementById('nlsp-api-key'));
            if (!url) return setStatus('请填写 Base URL', 'error');
            setStatus('拉取模型中…');
            try {
                state.api.url = url.trim();
                state.api.key = key;
                const models = await apiListModels(state);
                if (!models.length) return setStatus('未获取到任何模型', 'error');
                state.api.models = models;
                if (!state.api.model || !models.includes(state.api.model)) state.api.model = models[0];
                saveApiToLS(); saveState();
                setStatus(`已获取 ${models.length} 个模型，进入下一步…`, 'ok');
                state.connected = true;
                saveApiToLS(); saveState();
                render();
            } catch (e) {
                setStatus('拉取失败：' + (e && e.message || e), 'error');
            }
        });
        on('nlsp-next-btn', 'click', () => {
            state.api.url = val(getDoc().getElementById('nlsp-api-url')).trim();
            state.api.key = val(getDoc().getElementById('nlsp-api-key'));
            state.api.model = val(getDoc().getElementById('nlsp-api-model'));
            const mtEl = getDoc().getElementById('nlsp-api-maxtokens');
            state.api.maxTokens = Math.max(100, Number(mtEl ? mtEl.value : 30000) || 30000);
            state.connected = true;
            saveApiToLS(); saveState();
            render();
        });
    }

    /* ---------- 第三步：命名、读取世界书并初始化 ---------- */
    let wbList = [];
    function refreshWbList() { try { wbList = TH.getWorldbookNames() || []; } catch (e) { wbList = []; } }

    function renderInit() {
        refreshWbList();
        const wb = state.worldbook || {};
        const userBinding = getUserBinding();
        const editing = !!state._editingSetup;
        const rightHTML = (editing ? '<span class="nlsp-back" data-act="back-home">‹ 返回系统界面</span>' : '')
            + '<span class="nlsp-close" data-act="close">×</span>';
        setShell(`
            ${shellTopBar(editing ? '系统设置' : '初始化系统', editing ? '玩家绑定 · 世界书 · 生成与界面设置' : '第三步 · 绑定当前玩家并初始化', rightHTML)}
            <div class="nlsp-body">
                <div class="nlsp-pane">
                    <div class="nlsp-row">
                        <label class="nlsp-label">系统名称</label>
                        <input id="nlsp-sys-name" class="nlsp-input" placeholder="例如：星海遗迹" value="${escapeAttr(state.system.name)}" />
                    </div>
                    <div class="nlsp-row">
                        <label class="nlsp-label">核心作用（一句话）</label>
                        <input id="nlsp-sys-purpose" class="nlsp-input" placeholder="例如：在末世废土中经营避难所" value="${escapeAttr(state.system.purpose)}" />
                    </div>
                    <div class="nlsp-section-title">可选 · 读取世界书</div>
                    <div class="nlsp-row" style="display:flex; gap:8px;">
                        <select id="nlsp-wb-select" class="nlsp-select" style="flex:1;">
                            <option value="">-- 选择世界书 --</option>
                            ${wbList.map((n) => `<option value="${escapeAttr(n)}" ${n === wb.name ? 'selected' : ''}>${escapeText(n)}</option>`).join('')}
                        </select>
                        <button class="nlsp-btn ghost" id="nlsp-wb-load">读取</button>
                    </div>
                    <div id="nlsp-wb-info" style="margin-top:6px;">${renderWbInfoHTML(wb)}</div>
                    <div class="nlsp-section-title">酒馆玩家绑定</div>
                    <div class="nlsp-wb-box">
                        <div class="wb-name">已绑定 USER：${escapeText(userBinding.name)}</div>
                        <div class="wb-sum">存档键：${escapeText(userBinding.id)}\n系统只读取玩家身份、玩家 Persona、世界书和聊天正文；不会读取或绑定任何 CHAR 角色卡数据。</div>
                    </div>
                    <div class="nlsp-section-title">专属功能 · 数量与偏向</div>
                    <div class="nlsp-row" style="display:flex;gap:10px;align-items:center">
                        <label class="nlsp-label" style="margin:0;white-space:nowrap">生成数量</label>
                        <select id="nlsp-excl-count" class="nlsp-select" style="width:80px">
                            ${[1,2,3,4,5,6].map((n) => `<option value="${n}" ${(state.exclusiveFunctionCount||1)===n?'selected':''}>${n}</option>`).join('')}
                        </select>
                        <label class="nlsp-label" style="margin:0 0 0 16px;white-space:nowrap">复杂度</label>
                        <select id="nlsp-excl-complexity" class="nlsp-select" style="width:90px">
                            <option value="simple" ${state.exclComplexity!=='complex'?'selected':''}>简单</option>
                            <option value="complex" ${state.exclComplexity==='complex'?'selected':''}>复杂</option>
                        </select>
                    </div>
                    <div class="nlsp-row" style="display:flex;gap:10px;align-items:center;margin-top:6px">
                        <label class="nlsp-label" style="margin:0;white-space:nowrap">花费积分</label>
                        <select id="nlsp-excl-cost" class="nlsp-select" style="width:80px">
                            <option value="false" ${!state.exclCostPoints?'selected':''}>否</option>
                            <option value="true" ${state.exclCostPoints?'selected':''}>是</option>
                        </select>
                        <span class="nlsp-page-sub" style="margin:0">是则使用时扣积分</span>
                    </div>
                    <div id="nlsp-excl-prefs">${renderExclPrefs(state)}</div>
                    <div class="nlsp-section-title">主题</div>
                    <div class="nlsp-row">
                        <select id="nlsp-theme-select" class="nlsp-select">
                            ${Object.keys(THEMES).map((k) => { const t = THEMES[k]; return `<option value="${escapeAttr(k)}" ${state.theme === k ? 'selected' : ''}>${t.icon} ${escapeText(t.name)} · ${escapeText(t.desc)}</option>`; }).join('')}
                        </select>
                    </div>
                    <div class="nlsp-section-title">字体大小</div>
                    <div class="nlsp-row">
                        <select id="nlsp-font-scale" class="nlsp-select">
                            ${[[.85,'紧凑 85%'],[.95,'偏小 95%'],[1,'标准 100%'],[1.1,'舒适 110%'],[1.2,'大字 120%'],[1.35,'超大 135%']].map((x) => `<option value="${x[0]}" ${Math.abs((state.fontScale||1)-x[0])<.001?'selected':''}>${x[1]}</option>`).join('')}
                        </select>
                    </div>
                    <div class="nlsp-section-title">界面布局预设</div>
                    <div class="nlsp-row">
                        <select id="nlsp-layout-preset" class="nlsp-select">
                            ${Object.keys(PANEL_PRESETS).map((k) => `<option value="${escapeAttr(k)}" ${state.layoutPreset===k?'selected':''}>${escapeText(PANEL_PRESETS[k].name)} · ${PANEL_PRESETS[k].width}×${PANEL_PRESETS[k].height}</option>`).join('')}
                        </select>
                        <div class="nlsp-page-sub" style="margin-top:5px;">包含高面板 3:4、4:3、1:1、5:4、16:10、16:9 与 21:9。窗口超出屏幕时会自动收缩。</div>
                    </div>
                    <div class="nlsp-section-title">面板缩放</div>
                    <div class="nlsp-row" style="display:flex;gap:10px;align-items:center">
                        <button class="nlsp-btn ${state.scaleLocked?'ghost':''}" id="nlsp-scale-lock" style="${state.scaleLocked?'':'background:rgba(40,160,80,.6);border-color:rgba(60,200,100,.5)'}">${state.scaleLocked?'🔒 锁定':'🔓 解锁'}</button>
                        <span class="nlsp-page-sub" style="margin:0">解锁后可拖拽面板右下角调整大小</span>
                    </div>
                    <div class="nlsp-section-title">自动刷新（根据聊天剧情）</div>
                    <div class="nlsp-row" style="display:flex;gap:10px;align-items:center">
                        <label class="nlsp-label" style="margin:0;white-space:nowrap">开启自动刷新</label>
                        <select id="nlsp-auto-refresh" class="nlsp-select" style="width:80px">
                            <option value="false" ${!state.autoRefresh?'selected':''}>关闭</option>
                            <option value="true" ${state.autoRefresh?'selected':''}>开启</option>
                        </select>
                    </div>
                    <div class="nlsp-row" style="display:flex;gap:10px;align-items:center">
                        <label class="nlsp-label" style="margin:0;white-space:nowrap">读取上下文楼层数</label>
                        <input id="nlsp-context-floors" class="nlsp-input" type="number" min="1" max="50" value="${state.contextFloors||10}" style="width:80px" />
                    </div>
                    <div class="nlsp-row" style="display:flex;gap:10px;align-items:center">
                        <label class="nlsp-label" style="margin:0;white-space:nowrap">刷新间隔（每N轮AI回复）</label>
                        <input id="nlsp-refresh-interval" class="nlsp-input" type="number" min="1" max="20" value="${state.refreshInterval||1}" style="width:80px" />
                    </div>
                    ${hasOpenChat() ? '' : '<div class="nlsp-page-sub" style="color:#ff8a8a;margin:8px 0 0;">⚠ 当前没有可读取的聊天正文，无法初始化系统。请先进入任意酒馆聊天。</div>'}
                    <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                        ${editing ? '' : '<button class="nlsp-btn ghost" id="nlsp-back-api">返回</button>'}
                        ${editing ? '<button class="nlsp-btn ghost" id="nlsp-back-to-api">返回API设置</button>' : ''}
                        ${editing ? '<button class="nlsp-btn" style="background:rgba(200,40,50,.65);border-color:rgba(220,60,70,.5)" id="nlsp-clear-btn">清除所有设置</button>' : ''}
                        <button class="nlsp-btn" id="nlsp-init-btn">${editing ? '重新初始化系统' : '开始初始化系统'}</button>
                    </div>
                    <div id="nlsp-init-status" class="nlsp-page-sub" style="margin-top:10px;"></div>
                    <div id="nlsp-init-result"></div>
                </div>
            </div>
        `);
        bind('close', closePanel);
        if (editing) bind('back-home', () => { state._editingSetup = false; saveState(); if (!state.initialized) state.initialized = true; render(); });
        if (editing) on('nlsp-back-to-api', 'click', () => { state.connected = false; saveState(); renderApi(); });
        if (editing) on('nlsp-clear-btn', 'click', () => { clearSettings(); });
        if (!editing) on('nlsp-back-api', 'click', () => { state.connected = false; saveState(); renderApi(); });
        on('nlsp-wb-load', 'click', async () => {
            const name = val(getDoc().getElementById('nlsp-wb-select'));
            const box = getDoc().getElementById('nlsp-wb-info');
            if (!name) { if (box) box.innerHTML = '<div class="nlsp-page-sub" style="padding:4px 2px;color:#ff8a8a">请先选择一本世界书。</div>' + renderWbInfoHTML(state.worldbook || {}); return; }
            if (box) box.innerHTML = '<div class="nlsp-loading">读取世界书条目中…</div>';
            try {
                const entries = await TH.getWorldbook(name);
                const summary = summarizeWorldbook(name, entries);
                state.worldbook = { name, summary, entries };
                saveState();
                refreshWbInfo(box);
            } catch (e) {
                if (box) box.innerHTML = '<div class="nlsp-page-sub" style="color:#ff8a8a;padding:4px 2px;">读取失败：' + escapeText(e && e.message || e) + '</div>';
            }
        });
        on('nlsp-theme-select', 'change', () => {
            const sel = getDoc().getElementById('nlsp-theme-select');
            state.theme = sel && THEMES[sel.value] ? sel.value : 'hl-dark';
            saveState();
            applyTheme(state.theme);
        });
        on('nlsp-font-scale', 'change', () => {
            const sel = getDoc().getElementById('nlsp-font-scale');
            state.fontScale = Math.max(.85, Math.min(1.35, Number(sel && sel.value) || 1));
            saveState();
            const shell = getDoc().querySelector('.nlsp-shell');
            if (shell) shell.style.setProperty('--nlsp-font-scale', String(state.fontScale));
            setDebugHealth('layout', true, '字体 ' + Math.round(state.fontScale * 100) + '%');
        });
        on('nlsp-layout-preset', 'change', () => {
            const sel = getDoc().getElementById('nlsp-layout-preset');
            const key = sel && PANEL_PRESETS[sel.value] ? sel.value : 'wide-16-9';
            const preset = PANEL_PRESETS[key];
            state.layoutPreset = key;
            state.panelW = preset.width;
            state.panelH = preset.height;
            saveState();
            applyPanelResize();
            setDebugHealth('layout', true, preset.name);
        });
        on('nlsp-scale-lock', 'click', () => {
            state.scaleLocked = !state.scaleLocked;
            saveState();
            renderInit();
            applyPanelResize();
        });
        on('nlsp-auto-refresh', 'change', () => {
            const sel = getDoc().getElementById('nlsp-auto-refresh');
            state.autoRefresh = sel ? sel.value === 'true' : false;
            saveState();
            setupAutoRefresh();
            toast(state.autoRefresh ? '已开启自动刷新，每次AI回复后自动检查并刷新任务/商城' : '已关闭自动刷新', 'success');
        });
        on('nlsp-context-floors', 'change', () => {
            const inp = getDoc().getElementById('nlsp-context-floors');
            state.contextFloors = Math.max(1, Math.min(50, Number(inp ? inp.value : 10) || 10));
            if (inp) inp.value = state.contextFloors;
            saveState();
        });
        on('nlsp-refresh-interval', 'change', () => {
            const inp = getDoc().getElementById('nlsp-refresh-interval');
            state.refreshInterval = Math.max(1, Math.min(20, Number(inp ? inp.value : 1) || 1));
            if (inp) inp.value = state.refreshInterval;
            refreshCounter = 0;
            saveState();
        });
        on('nlsp-excl-count', 'change', () => {
            const sel = getDoc().getElementById('nlsp-excl-count');
            state.exclusiveFunctionCount = sel ? Math.max(1,Math.min(6,Number(sel.value)||1)) : 1;
            saveState();
            var box = getDoc().getElementById('nlsp-excl-prefs');
            if (box) box.innerHTML = renderExclPrefs(state);
        });
        on('nlsp-excl-complexity', 'change', () => {
            const sel = getDoc().getElementById('nlsp-excl-complexity');
            state.exclComplexity = sel && sel.value === 'complex' ? 'complex' : 'simple';
            saveState();
        });
        on('nlsp-excl-cost', 'change', () => {
            const sel = getDoc().getElementById('nlsp-excl-cost');
            state.exclCostPoints = sel ? sel.value === 'true' : false;
            saveState();
        });
        on('nlsp-init-btn', 'click', () => doInit());
    }

    function renderWbInfoHTML(wb) {
        if (!wb || !wb.name) return '<div class="nlsp-page-sub" style="padding:4px 2px;">读取后会基于世界书条目摘要生成系统。</div>';
        return renderWbBox(wb);
    }

    function refreshWbInfo(box) {
        const wb = state.worldbook;
        if (!wb || !wb.name) {
            box.innerHTML = '<div class="nlsp-page-sub" style="padding:4px 2px;">读取后会基于世界书条目摘要生成系统。</div>';
            return;
        }
        box.innerHTML = renderWbBox(wb);
        const clear = getDoc().getElementById('nlsp-wb-clear');
        if (clear) clear.addEventListener('click', () => {
            state.worldbook = { name: '', summary: '', entries: [] };
            saveState();
            refreshWbInfo(box);
            const sel = getDoc().getElementById('nlsp-wb-select');
            if (sel) sel.value = '';
        });
    }

    function renderWbBox(wb) {
        return `
            <div class="nlsp-wb-box">
                <div class="wb-name">已读取：${escapeText(wb.name)}（${(wb.entries || []).length} 条）</div>
                <div class="wb-sum">${escapeText(wb.summary || '（无摘要）')}</div>
                <div style="margin-top:8px;"><button class="nlsp-btn ghost" id="nlsp-wb-clear">清除</button></div>
            </div>`;
    }

    function renderExclPrefs(st){
        var n=st.exclusiveFunctionCount||1;
        var prefs=st.exclusivePreferences||[];
        var h='';
        for(var i=0;i<n;i++){
            h+='<div class="nlsp-row"><label class="nlsp-label">偏向 '+(i+1)+'（可选）</label><textarea class="nlsp-textarea nlsp-excl-pref-item" data-pref-idx="'+i+'" placeholder="留空则完全随机" style="min-height:40px">'+escapeText(prefs[i]||'')+'</textarea></div>';
        }
        return h;
    }

    async function doInit() {
        if (!requireOpenChat('初始化系统')) return;
        const name = val(getDoc().getElementById('nlsp-sys-name')).trim();
        const purpose = val(getDoc().getElementById('nlsp-sys-purpose')).trim();
        const setStatus = (m, t) => {
            const el = getDoc().getElementById('nlsp-init-status');
            if (!el) return; el.textContent = m;
            el.style.color = t === 'error' ? '#ff8a8a' : (t === 'ok' ? '#9dffb0' : '');
        };
        if (!name || !purpose) return setStatus('请填写名称与核心作用', 'error');
        state.system.name = name; state.system.purpose = purpose;
        var prefs=[];
        var prefEls=getDoc().querySelectorAll('.nlsp-excl-pref-item');
        for(var pi=0;pi<prefEls.length;pi++){prefs.push(String(prefEls[pi].value||'').trim());}
        state.exclusivePreferences=prefs;
        saveState();
        setStatus('正在调用模型初始化系统…');
        const box = getDoc().getElementById('nlsp-init-result');
        if (box) box.innerHTML = '<div class="nlsp-loading">生成中…系统简介、开门问候、首任务、商城、专属功能。</div>';
        let sysData = {}, taskData = [], shopItems = [], exclList = [];
        async function safeCall(label, fn) {
            try { return await fn; } catch (e) {
                console.warn('[自定义系统] ' + label + ' 失败：', e);
                recordDebugError(label, e, '初始化');
                setStatus(label + ' 失败：' + (e && e.message || e) + '（继续其他任务…）', 'error');
                return null;
            }
        }
        sysData = await safeCall('系统简介', apiInitSystem(state));
        taskData = await safeCall('任务', apiGenerateTask(state, { first: true }));
        shopItems = await safeCall('商城', apiGenerateShop(state));
        for(var ei=0;ei<(state.exclusiveFunctionCount||1);ei++){
            var ep=await safeCall('专属功能'+(ei+1), apiGenerateExclusive(state, prefs[ei]||'', state.exclComplexity||'simple'));
            if(ep)exclList.push(ep);
        }
        if (!sysData || !taskData) {
            setStatus('核心功能（简介/任务）生成失败，请检查 API 连接或缩短系统描述后重试。', 'error');
            if (box) box.innerHTML = '<div class="nlsp-muted">初始化被中断，请返回检查 API 配置。</div>';
            return;
        }
        state.system.summary = String(sysData.summary || '').trim();
        state.system.greeting = String(sysData.greeting || '').trim();
        state.points = Number(sysData.initialPoints ?? state.points) || state.points;
        state.tasks = Array.isArray(taskData) && taskData.length ? taskData : [];
        state.shop = shopItems || [];
        state.exclusiveFunctions = exclList;
        state.initialized = true;
        state._editingSetup = false;
        saveState();
        setStatus('初始化完成，请确认后进入系统', 'ok');
        if (box) box.innerHTML = `
            <div class="nlsp-result">
                <div class="nlsp-section-title">系统简介</div>
                <div>${escapeText(state.system.summary || '（无）')}</div>
                ${state.system.greeting ? `<div class="nlsp-section-title" style="margin-top:8px;">开场问候</div><div>${escapeText(state.system.greeting)}</div>` : ''}
                ${state.tasks[0] ? `<div class="nlsp-section-title" style="margin-top:8px;">首个任务</div><div style="color:#fff;font-weight:600;">${escapeText(state.tasks[0].name)}</div><div class="nlsp-page-sub">${escapeText(state.tasks[0].goal)}</div>` : ''}
                ${state.shop.length ? `<div class="nlsp-section-title" style="margin-top:8px;">首批商品</div><div class="nlsp-page-sub">${state.shop.length} 件</div>` : ''}
                ${exclList.length ? `<div class="nlsp-section-title" style="margin-top:8px;">专属功能 ${exclList.length} 个</div><div class="nlsp-page-sub">${exclList.map(function(e){return escapeText(e.name)}).join(' · ')}</div>` : '<div class="nlsp-section-title" style="margin-top:8px;">专属功能</div><div class="nlsp-page-sub" style="color:#ff8a8a;">生成失败（可进入后手动刷新）</div>'}
                <div class="nlsp-section-title" style="margin-top:8px;">起始积分：<span class="nlsp-pt">${state.points}</span></div>
            </div>
            <div style="display:flex; justify-content:center; margin-top:14px;">
                <button class="nlsp-btn" id="nlsp-confirm-btn">确认进入系统</button>
            </div>`;
        on('nlsp-confirm-btn', 'click', () => render());
    }

    /* ---------- 主界面：横向 4 标签 ---------- */
    let activeView = 'home';
    function renderMain() {
        setShell(`
            ${shellTopBar(state.system.name || '系统面板', state.system.purpose || '',
                `<span class="nlsp-pt-pill">积分 ${state.points}</span><span class="nlsp-icon" id="nlsp-cog" title="重新配置">⚙</span><span class="nlsp-close" id="nlsp-close-main" title="关闭">×</span>`)}
            <div class="nlsp-body"><div class="nlsp-pane" id="nlsp-pane"></div></div>
        `);
        on('nlsp-close-main', 'click', closePanel);
        on('nlsp-cog', 'click', () => { state._editingSetup = true; saveState(); renderInit(); });
        renderPane();
    }

    function openView(name) { activeView = name; renderPane(); }
    function backHome() { activeView = 'home'; renderPane(); }

    function renderPane() {
        const pane = getDoc().getElementById('nlsp-pane');
        if (!pane) return;
        if (activeView === 'home') return renderHome(pane);
        if (activeView === 'task') return renderAppView(pane, 'task', '系统任务', '点开始/完成接受任务并领奖', renderTaskBody);
        if (activeView === 'shop') return renderAppView(pane, 'shop', '系统商城', '调用模型生成并刷新商品', renderShopBody);
        if (activeView === 'draw') return renderAppView(pane, 'draw', '系统抽奖', '一连 ' + DRAW_COST_ONE + ' / 十连 ' + DRAW_COST_TEN, renderDrawBody);
        if (activeView === 'decompose') return renderAppView(pane, 'decompose', '物品分解', '输入物品名进行分解', renderDecomposeBody);
        if (activeView === 'chat') return renderChatView(pane);
        if (activeView.indexOf('excl')===0){var idx=parseInt(activeView.slice(4))||0;var excls=state.exclusiveFunctions||[];var ef=excls[idx]||{};return renderAppView(pane,'excl'+idx,ef.name||'专属功能',ef.desc||'',function(b){renderExclBody(b,idx)});}
    }

    function renderHome(pane) {
        const exclusive = state.exclusiveFunctions || [];
        const exclusiveIcons = exclusive.map(function(item, index) {
            return '<a class="nlsp-app" data-app="excl' + index + '"><span class="nlsp-app-ic">' + escapeText(item.icon || '⭐') + '</span><span class="nlsp-app-name">' + escapeText(item.name || '功能') + '</span></a>';
        }).join('');
        pane.innerHTML = `
${state.system.greeting ? '<div class="nlsp-banner"><div>SYSTEM.GREETING</div><div class="greet">' + escapeText(state.system.greeting) + '</div></div>' : ''}
<div class="nlsp-section-title">// FUNCTIONS</div>
<div class="nlsp-app-grid">
<a class="nlsp-app" data-app="task"><span class="nlsp-app-ic">📋</span><span class="nlsp-app-name">任务</span></a>
<a class="nlsp-app" data-app="shop"><span class="nlsp-app-ic">🛒</span><span class="nlsp-app-name">商城</span></a>
<a class="nlsp-app" data-app="draw"><span class="nlsp-app-ic">🎁</span><span class="nlsp-app-name">抽奖</span></a>
<a class="nlsp-app" data-app="decompose"><span class="nlsp-app-ic">♻</span><span class="nlsp-app-name">分解</span></a>
<a class="nlsp-app" data-app="chat"><span class="nlsp-app-ic">💬</span><span class="nlsp-app-name">对话</span></a>
${exclusiveIcons}
</div>
<div class="nlsp-section-title" style="display:flex;justify-content:space-between;align-items:center;margin-top:18px">// TASKS<span class="nlsp-btn ghost" id="nlsp-task-refresh-home">REFRESH</span></div>
<div id="nlsp-task-list-home"></div>
`;
        pane.querySelectorAll('.nlsp-app').forEach(function(app) {
            app.addEventListener('click', function() { openView(app.getAttribute('data-app')); });
        });
        paintHomeTasks();
        const refresh = getDoc().getElementById('nlsp-task-refresh-home');
        if (refresh) refresh.addEventListener('click', async function() {
            refresh.disabled = true;
            const list = getDoc().getElementById('nlsp-task-list-home');
            if (list) list.innerHTML = '<div class="nlsp-loading">generating...</div>';
            try {
                state.tasks = mergeTaskRefresh(await apiGenerateTask(state, { first: false }));
                saveState();
                paintHomeTasks();
                toast('tasks refreshed', 'success');
            } catch (e) {
                recordDebugError('任务刷新', e, '主页');
                if (list) list.innerHTML = '<div class="nlsp-muted">refresh failed</div>';
            } finally {
                refresh.disabled = false;
            }
        });
    }

    function paintHomeTasks() {
        const list = getDoc().getElementById('nlsp-task-list-home');
        if (!list) return;
        if (!state.tasks.length) { list.innerHTML = '<div class="nlsp-muted">NO ACTIVE TASKS</div>'; return; }
        list.innerHTML = state.tasks.map(function(task, index) {
            return '<div class="nlsp-card nlsp-task-card"><div class="tmeta"><span class="seq">#' + (index + 1) + '</span><span class="iname">' + escapeText(task.name || '') + '</span>' +
                (task.status === 'done' ? '<span class="status-done">DONE</span>' : (task.status === 'doing' ? '<span class="status-doing">ACTIVE</span>' : '<span class="nlsp-page-sub">PENDING</span>')) +
                '</div><div class="tdesc">' + escapeText(task.desc || '') + '</div><div class="tgoal">OBJECTIVE: ' + escapeText(task.goal || '') + '</div><div class="treward">REWARD: <span class="nlsp-pt">' + (task.reward || 0) + ' PTS</span>' +
                (task.itemReward ? ' · ' + escapeText(task.itemReward) : '') + '</div><div class="tactions">' +
                (task.status === 'done' ? '<span class="status-done">CLAIMED</span>' : '<button class="nlsp-btn ghost" data-home-start="' + index + '" ' + (task.status === 'doing' ? 'disabled' : '') + '>START</button><button class="nlsp-btn" data-home-done="' + index + '" ' + (task.status !== 'doing' ? 'disabled' : '') + '>COMPLETE</button>') + '</div></div>';
        }).join('');
        list.querySelectorAll('[data-home-start]').forEach(function(button) {
            button.addEventListener('click', function() {
                const index = Number(button.getAttribute('data-home-start'));
                const task = state.tasks[index];
                if (!task || task.status === 'doing') return;
                task.status = 'doing';
                saveState();
                paintHomeTasks();
                toast('started: ' + task.name, 'success');
                insertIntoChat('📋 ' + task.name, 'OBJECTIVE: ' + task.goal + '\n' + (task.desc || ''), 'task');
            });
        });
        list.querySelectorAll('[data-home-done]').forEach(function(button) {
            button.addEventListener('click', function() {
                completeTask(Number(button.getAttribute('data-home-done')));
                paintHomeTasks();
            });
        });
    }


    function renderAppView(pane, key, title, sub, bodyFn) {
        pane.innerHTML = `
            <div class="nlsp-page-head">
                <span class="nlsp-back" data-back="1">‹ 返回</span>
                <div style="text-align:right;"><div class="nlsp-page-title">${escapeText(title)}</div><div class="nlsp-page-sub">${escapeText(sub)}</div></div>
            </div>
            <div id="nlsp-${key}-body"></div>
        `;
        const back = pane.querySelector('[data-back="1"]');
        if (back) back.addEventListener('click', backHome);
        const body = getDoc().getElementById('nlsp-' + key + '-body');
        if (body) bodyFn(body);
    }

    /* ---------- 小游戏：扫雷 ---------- */

    /* ---------- 小游戏：扫雷 ---------- */
    var mineGame = { grid:[], rows:8, cols:8, mines:10, over:false, revealed:0, flags:0 };
    function initMineGame() {
        mineGame = { grid:[], rows:8, cols:8, mines:10, over:false, revealed:0, flags:0 };
        var r=mineGame.rows,c=mineGame.cols;
        for(var i=0;i<r;i++){ mineGame.grid[i]=[]; for(var j=0;j<c;j++) mineGame.grid[i][j]={mine:false,revealed:false,flagged:false,adj:0}; }
        var placed=0;
        while(placed<mineGame.mines){ var ri=Math.floor(Math.random()*r),ci=Math.floor(Math.random()*c); if(!mineGame.grid[ri][ci].mine){ mineGame.grid[ri][ci].mine=true;placed++;} }
        for(var i=0;i<r;i++)for(var j=0;j<c;j++)if(!mineGame.grid[i][j].mine){var cnt=0;for(var di=-1;di<=1;di++)for(var dj=-1;dj<=1;dj++){var ni=i+di,nj=j+dj;if(ni>=0&&ni<r&&nj>=0&&nj<c&&mineGame.grid[ni][nj].mine)cnt++;}mineGame.grid[i][j].adj=cnt;}
    }
    function revealCell(i,j){
        if(mineGame.over||i<0||i>=mineGame.rows||j<0||j>=mineGame.cols)return;
        var c=mineGame.grid[i][j];
        if(c.revealed||c.flagged)return;
        c.revealed=true;mineGame.revealed++;
        if(c.mine){mineGame.over=true;gameOver(false);return;}
        if(c.adj===0){for(var di=-1;di<=1;di++)for(var dj=-1;dj<=1;dj++)revealCell(i+di,j+dj);}
        paintMineBoard();
        if(mineGame.revealed+mineGame.mines>=mineGame.rows*mineGame.cols)mineGame.over=true,gameOver(true);
    }
    function gameOver(won){
        var area=document.getElementById('nlsp-mine-board');
        if(!area)return;
        if(won)toast('扫雷胜利！', 'success');
        else{for(var i=0;i<mineGame.rows;i++)for(var j=0;j<mineGame.cols;j++)mineGame.grid[i][j].revealed=true;}
        paintMineBoard();
    }
    function paintMineBoard(){
        var area=document.getElementById('nlsp-mine-board');
        if(!area)return;
        var h='';
        for(var i=0;i<mineGame.rows;i++){
            h+='<div style="display:flex">';
            for(var j=0;j<mineGame.cols;j++){
                var c=mineGame.grid[i][j];
                var cls='nlsp-mine-cell';
                if(c.revealed){cls+=' nlsp-mine-open';if(c.mine)cls+=' nlsp-mine-boom';}
                if(!c.revealed&&!c.flagged)cls+=' nlsp-mine-closed';
                var txt='';
                if(c.revealed&&c.mine)txt='💣';
                else if(c.revealed&&c.adj>0)txt=c.adj;
                else if(c.flagged)txt='🚩';
                h+='<div class="'+cls+'" data-mi="'+i+'" data-mj="'+j+'" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;cursor:'+(mineGame.over?'default':'pointer')+'">'+txt+'</div>';
            }
            h+='</div>';
        }
        area.innerHTML=h;
        area.querySelectorAll('.nlsp-mine-cell').forEach(function(el){
            if(mineGame.over)return;
            el.addEventListener('click',function(){revealCell(parseInt(el.dataset.mi),parseInt(el.dataset.mj))});
            el.addEventListener('contextmenu',function(e){e.preventDefault();var ii=parseInt(el.dataset.mi),jj=parseInt(el.dataset.mj);var cc=mineGame.grid[ii][jj];if(cc.revealed)return;cc.flagged=!cc.flagged;paintMineBoard()});
        });
    }
    function renderGameView(pane){
        initMineGame();
        pane.innerHTML='<div class="nlsp-page-head"><span class="nlsp-back" data-back="1">‹ 返回</span><div style="text-align:right"><div class="nlsp-page-title">扫雷</div><div class="nlsp-page-sub">8×8 · '+mineGame.mines+' 雷</div></div></div><div style="display:flex;justify-content:center;margin:10px 0"><button class="nlsp-btn ghost" id="nlsp-mine-new">新游戏</button></div><div id="nlsp-mine-board" style="display:inline-block;margin:0 auto"></div>';
        var back=pane.querySelector('[data-back="1"]');
        if(back)back.addEventListener('click',backHome);
        paintMineBoard();
        var btn=document.getElementById('nlsp-mine-new');
        if(btn)btn.addEventListener('click',function(){initMineGame();paintMineBoard()});
    }

    function renderTaskBody(body) {
        body.innerHTML = `
            <div class="nlsp-page-head">
                <span class="nlsp-page-sub">做完事点「完成」领奖</span>
                <button class="nlsp-btn ghost" id="nlsp-task-refresh">刷新任务</button>
            </div>
            <div id="nlsp-task-list"></div>
        `;
        paintTasks();
        on('nlsp-task-refresh', 'click', async () => {
            const btn = getDoc().getElementById('nlsp-task-refresh');
            if (btn) btn.disabled = true;
            const list = getDoc().getElementById('nlsp-task-list');
            if (list) list.innerHTML = '<div class="nlsp-loading">正在生成新任务…</div>';
            try {
                const tasks = await apiGenerateTask(state, { first: false });
                state.tasks = mergeTaskRefresh(tasks || []);
                saveState();
                paintTasks();
                toast('任务已刷新', 'success');
            } catch (e) {
                recordDebugError('任务刷新', e, '任务页');
                if (list) list.innerHTML = `<div class="nlsp-muted">刷新失败：${escapeText(e && e.message || e)}</div>`;
                toast('刷新失败', 'error');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    function mergeTaskRefresh(generated) {
        const kept = (state.tasks || []).filter((t) => t && (t.status === 'doing' || t.status === 'done')).slice(-20);
        const seen = new Set(kept.map((t) => normalizeFingerprintText(t.name + '|' + t.goal)));
        const fresh = (Array.isArray(generated) ? generated : []).filter((t) => {
            const key = normalizeFingerprintText((t && t.name) + '|' + (t && t.goal));
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        return kept.concat(fresh).slice(-30);
    }

    function paintTasks() {
        const list = getDoc().getElementById('nlsp-task-list');
        if (!list) return;
        if (!state.tasks.length) {
            list.innerHTML = '<div class="nlsp-muted">暂无任务，点击右上角“刷新任务”生成。</div>';
            return;
        }
        list.innerHTML = '<div class="nlsp-rows">' + state.tasks.map((t, i) => `
            <div class="nlsp-card nlsp-task-card" style="margin-bottom:10px;">
                <div class="tmeta">
                    <span class="seq">#${i + 1}</span>
                    <span class="iname">${escapeText(t.name || '未命名任务')}</span>
                    ${t.status === 'done' ? '<span class="status-done">已完成</span>' : (t.status === 'doing' ? '<span class="status-doing">进行中</span>' : '<span class="nlsp-page-sub">未开始</span>')}
                </div>
                <div class="tdesc" style="margin-top:4px;">${escapeText(t.desc || '')}</div>
                <div class="tgoal" style="margin-top:4px;">目标：${escapeText(t.goal || '')}</div>
                <div class="treward" style="margin-top:2px;">奖励：<span class="nlsp-pt">${Number(t.reward || 0)} 积分</span>${t.itemReward ? ' · ' + escapeText(t.itemReward) : ''}</div>
                <div class="tactions">
                    ${t.status === 'done' ? '<span class="status-done" style="padding:4px;">已领取奖励</span>' :
                        `<button class="nlsp-btn ghost" data-task-start="${i}" ${t.status === 'doing' ? 'disabled' : ''}>${t.status === 'doing' ? '进行中' : '开始'}</button>
                         <button class="nlsp-btn" data-task-done="${i}" ${t.status !== 'doing' ? 'disabled' : ''}>完成</button>`}
                </div>
            </div>`).join('') + '</div>';
        bindTask('data-task-start', (i) => {
            const t = state.tasks[i];
            if (!t) return;
            if (t.status !== 'doing') t.status = 'doing';
            saveState(); paintTasks();
            toast('已开始任务：' + t.name, 'success');
            insertIntoChat('📋 接受任务：' + (t.name || ''),
                '介绍：' + (t.desc || '') + '\n目标：' + (t.goal || '') + (t.reward ? '\n奖励：' + t.reward + ' 积分' : '') + (t.itemReward ? ' · ' + t.itemReward : ''), 'task');
        });
        bindTask('data-task-done', (i) => completeTask(i));
    }

    function bindTask(attr, cb) {
        const pane = getDoc().getElementById('nlsp-pane');
        if (!pane) return;
        pane.querySelectorAll(`[${attr}]`).forEach((b) => {
            b.addEventListener('click', () => cb(Number(b.getAttribute(attr))));
        });
    }

    function completeTask(i) {
        const t = state.tasks[i];
        if (!t || t.status !== 'doing') return;
        return settleTask(t, { source: 'manual', evidence: '用户手动点击完成' });
    }

    function settleTask(t, meta) {
        if (!t || t.status !== 'doing' || t.rewardClaimed) return false;
        const reward = Number(t.reward || 0);
        t.status = 'done';
        t.rewardClaimed = true;
        t.settledAt = Date.now();
        t.settlementSource = String(meta && meta.source || 'unknown');
        t.settlementEvidence = String(meta && meta.evidence || '').slice(0, 240);
        state.points += reward;
        if (t.itemReward) pushInventory([{ name: t.itemReward, category: '任务奖励', desc: '完成任务「' + (t.name || '') + '」所得', rarity: '稀有', from: '任务' }]);
        saveState();
        toast(`任务完成，获得 ${reward} 积分${t.itemReward ? ' · ' + t.itemReward : ''}`, 'success');
        paintTasks();
        paintHomeTasks();
        renderMainTop();
        return true;
    }

    function renderMainTop() {
        /* 仅刷新积分胶囊 */
        const pill = getDoc().querySelector('.nlsp-pt-pill');
        if (pill) pill.textContent = '积分 ' + state.points;
    }

    /* 首次获得物品时，在 ST 输入框自动填入一次静默变量指令（不重复填写） */
    function pushInventory(items) {
        const norm = [];
        if (Array.isArray(items)) for (const it of items) {
            if (!it || !it.name) continue;
            norm.push({
                name: String(it.name).slice(0, 60),
                category: String(it.category || '').slice(0, 30),
                desc: String(it.desc || it.function || '').slice(0, 200),
                rarity: String(it.rarity || '普通').slice(0, 12),
                from: String(it.from || '商城').slice(0, 20),
                time: Date.now()
            });
        }
        if (!norm.length) return;
        state.inventory = state.inventory.concat(norm);
        if (state.inventory.length > 999) state.inventory = state.inventory.slice(-999);
        saveState();
    }

    /* ---------- 商城 ---------- */
    function renderShopBody(body) {
        body.innerHTML = `
            <div class="nlsp-page-head">
                <span class="nlsp-page-sub">当前积分 <span class="nlsp-pt">${state.points}</span></span>
                <button class="nlsp-btn ghost" id="nlsp-shop-refresh">刷新商品</button>
            </div>
            <div id="nlsp-shop-list"></div>
        `;
        paintShop();
        on('nlsp-shop-refresh', 'click', async () => {
            const btn = getDoc().getElementById('nlsp-shop-refresh');
            if (btn) btn.disabled = true;
            const list = getDoc().getElementById('nlsp-shop-list');
            if (list) list.innerHTML = '<div class="nlsp-loading">正在生成商品…</div>';
            try {
                const items = await apiGenerateShop(state);
                state.shop = items;
                saveState();
                paintShop();
                renderMainTop();
                toast('商城已刷新', 'success');
            } catch (e) {
                if (list) list.innerHTML = `<div class="nlsp-muted">刷新失败：${escapeText(e && e.message || e)}</div>`;
                toast('刷新失败', 'error');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    function paintShop() {
        const list = getDoc().getElementById('nlsp-shop-list');
        if (!list) return;
        if (!state.shop.length) { list.innerHTML = '<div class="nlsp-muted">暂无商品，点击右上角“刷新商品”生成。</div>'; return; }
        list.innerHTML = `<div class="nlsp-grid3">` + state.shop.map((it, i) => `
            <div class="nlsp-card">
                <div class="iname">${escapeText(it.name || '未命名')}</div>
                <span class="icate">${escapeText(it.category || '未分类')}</span>
                <div class="idesc">${escapeText(it.desc || it.function || '')}</div>
                <div class="ibot">
                    <span class="nlsp-pt">${Number(it.cost || 0)} 积分</span>
                    <button class="nlsp-btn" data-buy="${i}" ${state.points < (it.cost || 0) ? 'disabled' : ''}>购买</button>
                </div>
            </div>`).join('') + `</div>`;
        list.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => buyItem(Number(b.getAttribute('data-buy')))));
    }

    function buyItem(idx) {
        const item = state.shop[idx];
        if (!item) return;
        const cost = Number(item.cost || 0);
        if (state.points < cost) return toast('积分不足', 'error');
        state.points -= cost;
        pushInventory([{ name: item.name, category: item.category, desc: item.desc || item.function || '', rarity: item.rarity || '普通', from: '商城' }]);
        saveState();
        toast(`已购买「${item.name}」`, 'success');
        insertIntoChat('✅ 已购买「' + (item.name || '') + '」', '介绍：' + (item.desc || item.function || '') + (item.category ? '\n类别：' + item.category : '') + (item.rarity ? '\n稀有度：' + item.rarity : ''));
        renderMainTop(); paintShop();
    }

    /* ---------- 抽奖 ---------- */
    function renderDrawBody(body) {
        body.innerHTML = `
            <div class="nlsp-page-head">
                <span class="nlsp-page-sub">当前积分 <span class="nlsp-pt">${state.points}</span></span>
                <div style="display:flex; gap:8px;">
                    <button class="nlsp-btn ghost" id="nlsp-draw-1">一连抽 (${DRAW_COST_ONE})</button>
                    <button class="nlsp-btn" id="nlsp-draw-10">十连抽 (${DRAW_COST_TEN})</button>
                </div>
            </div>
            ${state.draws.length ? '<div class="nlsp-section-title" style="margin:14px 0 8px;">最近抽奖结果</div>' : ''}
            <div id="nlsp-draw-area">${state.draws.length ? renderDrawResults(state.draws) : '<div class="nlsp-muted">尚未抽奖。</div>'}</div>
        `;
        on('nlsp-draw-1', 'click', () => doDraw(1));
        on('nlsp-draw-10', 'click', () => doDraw(10));
    }

    function renderDrawResults(list) {
        return list.map((g) => `
            <div class="nlsp-result">
                <div class="nlsp-section-title" style="margin:0 0 4px;">${escapeText(g.title)} · <span class="nlsp-pt">-${g.cost}</span></div>
                ${g.items.map((it) => `
                    <div style="display:flex; gap:8px; align-items:center; padding:6px 0; border-top:1px solid ${cyber.cyan}1a;">
                        <span class="nlsp-rarity nlsp-r-${escapeAttr(it.rarity || '普通')}">${escapeText(it.rarity || '普通')}</span>
                        <span style="color:#fff; font-weight:600;">${escapeText(it.name || '未知')}</span>
                        <span class="nlsp-page-sub">[${escapeText(it.category || '')}] ${escapeText(it.desc || '')}</span>
                    </div>`).join('')}
            </div>`).join('');
    }

    async function doDraw(count) {
        const cost = count === 10 ? DRAW_COST_TEN : DRAW_COST_ONE;
        if (state.points < cost) return toast('积分不足，无法抽奖', 'error');
        const area = getDoc().getElementById('nlsp-draw-area');
        const old = area ? area.innerHTML : '';
        if (area) area.innerHTML = '<div class="nlsp-loading">正在生成抽奖结果…</div>';
        try {
            const items = await apiGenerateDraw(state, count);
            state.points -= cost;
            const group = { title: count === 10 ? '十连抽结果' : '一连抽结果', cost, items, time: Date.now() };
            state.draws = [group, ...state.draws].slice(0, 12);
            pushInventory(items.map((it) => ({ name: it.name, category: it.category, desc: it.desc, rarity: it.rarity || '普通', from: '抽奖' })));
            saveState();
            if (area) area.innerHTML = renderDrawResults(state.draws);
            renderMainTop();
            const gainLines = items.map((it) => '【' + (it.name || '未知') + '】' + (it.desc || '') + (it.rarity ? '（' + it.rarity + '）' : ''));
            insertIntoChat('🎁 抽奖完成，本次获得物品', gainLines.join('\n') || '（无）', 'draw');
            toast('抽奖完成', 'success');
        } catch (e) {
            if (area) area.innerHTML = `<div class="nlsp-muted">抽奖失败：${escapeText(e && e.message || e)}</div>` + old;
            toast('抽奖失败', 'error');
        }
    }

    /* ---------- 分解 ---------- */
    function renderDecomposeBody(body) {
        body.innerHTML = `
            <div class="nlsp-page-head">
                <span class="nlsp-page-sub">输入物品名进行分解，越高级的物品分解积分越多</span>
            </div>
            <div class="nlsp-row">
                <label class="nlsp-label">物品名称</label>
                <input id="nlsp-decomp-name" class="nlsp-input" placeholder="输入要分解的物品名…" />
            </div>
            <div style="margin-top:10px;">
                <button class="nlsp-btn" id="nlsp-decomp-go">分解</button>
            </div>
            <div id="nlsp-decomp-status" class="nlsp-page-sub" style="margin-top:10px;"></div>
        `;
        on('nlsp-decomp-go', 'click', async () => {
            var inp = getDoc().getElementById('nlsp-decomp-name');
            var name = inp ? String(inp.value||'').trim() : '';
            if (!name) return toast('请输入物品名', 'error');
            var stEl = getDoc().getElementById('nlsp-decomp-status');
            if (stEl) stEl.textContent = '分解中…';
            try {
                var sysName = state.system.name || '系统面板';
                var r = await apiChat(state, {
                    system: '你是物品分解师。根据物品的名称和设定判断其稀有程度，给出分解所得积分和简短描述。必须只输出一行JSON。',
                    user: '在系统「'+sysName+'」中分解物品：'+name+'。物品名越厉害/越稀有/越传说级，积分越高（普通杂物50~200，稀有物品300~800，史诗级1000~3000，传说神兵5000~20000）。返回JSON：{"points":整数,"desc":"一句话描述分解产物"}',
                    temperature: 0.8, maxTokens: 100
                });
                var d=extractJson(r);
                var points=Math.max(10,Math.floor(Number(d.points)||100));
                var desc=String(d.desc||'').trim()||'分解完成，获得基础材料';
                if (stEl) { stEl.textContent = desc+'（+'+points+' 积分）'; stEl.style.color = '#9dffb0'; }
                state.points += points;
                saveState();
                renderMainTop();
                await insertIntoChat('分解「' + name + '」', '获得 '+points+' 积分\n'+desc, 'decompose');
                if (inp) inp.value = '';
                toast('分解获得 '+points+' 积分', 'success');
            } catch (e) {
                if (stEl) { stEl.textContent = '分解失败：' + (e&&e.message||e); stEl.style.color = '#ff8a8a'; }
            }
        });
    }

    /* ---------- 对话 ---------- */
    function renderChatView(pane) {
        pane.style.display = 'flex';
        pane.style.flexDirection = 'column';
        pane.style.padding = '8px 6px 0 6px';
        pane.innerHTML = `
            <div class="nlsp-page-head" style="margin:0 6px 6px;">
                <span class="nlsp-back" data-back="1">‹ 返回</span>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span class="nlsp-page-sub">与「${escapeText(state.system.name || '系统')}」对话</span>
                </div>
            </div>
            <div class="nlsp-chat" id="nlsp-chat-area">${renderChatMessages()}</div>
            <div class="nlsp-input-bar">
                <input id="nlsp-chat-input" class="nlsp-input" placeholder="和系统聊聊…" />
                <button class="nlsp-btn" id="nlsp-chat-send">发送</button>
            </div>
        `;
        const back = pane.querySelector('[data-back="1"]');
        if (back) back.addEventListener('click', backHome);
        scrollToBottom();
        const sendBtn = getDoc().getElementById('nlsp-chat-send');
        const inputEl = getDoc().getElementById('nlsp-chat-input');
        const send = () => {
            const text = (inputEl && inputEl.value || '').trim();
            if (!text) return;
            inputEl.value = '';
            appendChat('user', text);
            chatSend(text);
        };
        if (sendBtn) sendBtn.addEventListener('click', send);
        if (inputEl) inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    }

    /* ---------- 专属功能 ---------- */
    function renderExclBody(body, idx) {
        idx=idx||0;
        var excls=state.exclusiveFunctions||[];
        const ef = excls[idx] || {};
        const prefs=state.exclusivePreferences||[];
        var curPref=prefs[idx]||'';
        const streak = state._streak || 0;
        const reward = Math.floor(streak * 12 + 20 + Math.random() * 30);
        const html = (ef.html || '')
            .replace(/\{%\s*points\s*%\}/g, String(state.points))
            .replace(/\{%\s*streak\s*%\}/g, String(streak))
            .replace(/\{%\s*reward\s*%\}/g, String(reward));
        body.innerHTML = `
            <div class="nlsp-page-head">
                <span class="nlsp-page-sub">${escapeText(ef.desc || '')}${state.exclCostPoints&&ef.cost?(' · 每次花费 '+ef.cost+' 积分'):''}</span>
                <button class="nlsp-btn ghost" id="nlsp-excl-refresh">刷新</button>
                ${state.exclCostPoints ? '<button class="nlsp-btn ghost" id="nlsp-excl-refresh-cost">💰刷新花费</button>' : ''}
            </div>
            <div id="nlsp-excl-content">${html || '<div class="nlsp-muted">专属功能已生成，点击刷新按钮重新生成。</div>'}</div>
            <div id="nlsp-excl-status" class="nlsp-page-sub" style="margin-top:10px;"></div>
        `;
        bindExclActions();
        on('nlsp-excl-refresh-cost', 'click', async () => {
            var btn = getDoc().getElementById('nlsp-excl-refresh-cost');
            if (btn) btn.disabled = true;
            try {
                var excls = state.exclusiveFunctions || [];
                var cur = excls[idx] || {};
                cur.cost = await apiRefreshExclCost(state, cur);
                excls[idx] = cur;
                saveState();
                renderExclBody(body, idx);
                toast('花费已更新为 ' + cur.cost + ' 积分', 'success');
            } catch(e) {
                toast('刷新失败：' + (e && e.message || e), 'error');
            }
            if (btn) btn.disabled = false;
        });
        on('nlsp-excl-refresh', 'click', () => {
            const area = getDoc().getElementById('nlsp-excl-content');
            if (!area) return;
            area.innerHTML = '<div class="nlsp-card" id="nlsp-excl-dialog"><div class="nlsp-section-title">专属功能提示词</div><div class="nlsp-page-sub" style="margin-bottom:6px">修改后点击生成，留空则完全随机。</div><textarea id="nlsp-excl-dlg-pref" class="nlsp-textarea" style="min-height:70px">'+escapeText(curPref)+'</textarea><div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end"><button class="nlsp-btn ghost" id="nlsp-excl-dlg-cancel">取消</button><button class="nlsp-btn" id="nlsp-excl-dlg-go">使用此提示词生成</button></div></div>';
            on('nlsp-excl-dlg-cancel', 'click', () => { if(area) renderExclBody(body, idx); });
            on('nlsp-excl-dlg-go', 'click', async () => {
                const ta = getDoc().getElementById('nlsp-excl-dlg-pref');
                var p = ta ? String(ta.value||'').trim() : curPref;
                if (!state.exclusivePreferences) state.exclusivePreferences=[];
                state.exclusivePreferences[idx]=p;
                saveState();
                if (area) area.innerHTML = '<div class="nlsp-loading">正在生成专属功能…</div>';
                try {
                    const data = await apiGenerateExclusive(state, p);
                    if(data){if(!state.exclusiveFunctions)state.exclusiveFunctions=[];state.exclusiveFunctions[idx]=data;}
                    saveState();
                    renderExclBody(body, idx);
                    toast('专属功能已刷新', 'success');
                } catch (e) {
                    if (area) { area.innerHTML = '<div class="nlsp-card"><div class="nlsp-muted">刷新失败：'+escapeText(e&&e.message||e)+'</div><button class="nlsp-btn ghost" id="nlsp-excl-retry">重试</button></div>'; on('nlsp-excl-retry','click',()=>{const b=getDoc().getElementById('nlsp-excl-refresh');if(b)b.click();}); }
                    toast('刷新失败', 'error');
                }
            });
        });
    }

    function bindExclActions() {
        var bodyId='nlsp-'+activeView+'-body';
        const body = getDoc().getElementById(bodyId);
        if (!body) return;
        var clickables = body.querySelectorAll('[data-excl-act], button:not([disabled]), a[class], [role=button], .nlsp-btn');
        clickables.forEach((b) => {
            if (b._nlspBound) return;
            b._nlspBound = true;
            b.addEventListener('click', async (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                var act = b.getAttribute('data-excl-act') || b.textContent.trim().slice(0,20) || '操作';
                var btnCost = parseInt(b.getAttribute('data-excl-cost')) || 0;
                if (!btnCost) {
                    var m = b.textContent.match(/(\d{2,6})/);
                    if (m) btnCost = parseInt(m[1]);
                }
                b.disabled = true;
                b.style.opacity = '0.5';
                try { await handleExclAction(act, btnCost); } catch (e) { toast('操作失败：' + (e && e.message || e), 'error'); }
                b.disabled = false;
                b.style.opacity = '';
            });
        });
    }

    async function handleExclAction(act, btnCost) {
        var excls=state.exclusiveFunctions||[];
        var ef=excls[0]||{};
        if(activeView.indexOf('excl')===0){var i=parseInt(activeView.slice(4))||0;ef=excls[i]||{};}
        try { if (typeof eventEmit === 'function') { eventEmit('excl_action', { name: ef.name||'专属功能', action: act }); } } catch(e) {}
        var realCost = (state.exclCostPoints ? (btnCost || ef.cost || 0) : 0);
        if (realCost > 0) {
            if (state.points < realCost) { toast('积分不足，需要 ' + realCost + ' 积分，当前仅有 ' + state.points, 'error'); return; }
            state.points -= realCost;
            saveState();
            if (typeof renderMainTop === 'function') renderMainTop();
            var pillEl = getDoc().querySelector('.nlsp-pt-pill');
            if (pillEl) pillEl.textContent = '积分 ' + state.points;
            toast('已扣除 '+realCost+' 积分，剩余 '+state.points, 'success')}
        const stEl = getDoc().getElementById('nlsp-excl-status');
        if (stEl) { stEl.textContent = '处理中…'; stEl.style.color = ''; }
        try {
            const result = await apiChat(state, {
                system: '你是系统的专属功能处理器，根据系统上下文执行用户请求的操作。只返回简短的自然语言结果，不超过80字。',
                user: '系统「' + state.system.name + '」专属功能的操作标签：' + act + '。请执行此操作并返回结果。',
                temperature: 0.7, maxTokens: 120
            });
            if (stEl) { stEl.textContent = String(result).trim(); stEl.style.color = '#9dffb0'; }
            const pts = extractPoints(result);
            if (pts) { state.points += pts; saveState(); renderMainTop(); toast('获得 ' + pts + ' 积分', 'success'); }
            await insertIntoChat('⭐ ' + (ef.name||'专属功能') + ' · ' + act,
                '操作结果：' + String(result).trim(),
                'excl');
        } catch (e) {
            if (stEl) { stEl.textContent = '失败：' + (e && e.message || e); stEl.style.color = '#ff8a8a'; }
        }
    }

    function extractPoints(text) {
        const m = String(text || '').match(/[+-]?\d+/g);
        if (!m) return 0;
        let total = 0;
        for (const s of m) total += parseInt(s, 10) || 0;
        return Math.abs(total) < 100 ? total : 0;
    }

    function renderChatMessages() {
        if (!state.chat.length) return '<div class="nlsp-p-empty">还没有对话，发条消息开始吧。</div>';
        return state.chat.map((m) => `
            <div class="nlsp-msg ${m.role === 'user' ? 'user' : 'ai'}">
                <div class="meta">${m.role === 'user' ? '我' : escapeText(state.system.name || '系统')}</div>
                ${escapeText(m.content)}
            </div>`).join('');
    }

    function appendChat(role, content, opts) {
        state.chat.push({ role, content, time: Date.now() });
        if (state.chat.length > 80) state.chat = state.chat.slice(-80);
        saveState();
        const area = getDoc().getElementById('nlsp-chat-area');
        if (!area) return;
        area.innerHTML = renderChatMessages();
        scrollToBottom();
    }

    function scrollToBottom() {
        const area = getDoc().getElementById('nlsp-chat-area');
        if (area) area.scrollTop = area.scrollHeight;
    }

    async function chatSend(text) {
        appendChat('system', '正在思考…');
        try {
            const reply = await apiChatReply(state, text);
            state.chat.pop();
            saveState();
            appendChat('assistant', reply);
        } catch (e) {
            state.chat.pop();
            saveState();
            appendChat('system', '调用失败：' + (e && e.message || e));
        }
    }

    /* ---------- 工具：DOM ---------- */
    function bind(act, fn) {
        const el = overlay() && overlay().querySelector(`[data-act="${act}"]`);
        if (el) el.addEventListener('click', fn);
    }
    function on(id, evt, fn) { const el = getDoc().getElementById(id); if (el) el.addEventListener(evt, fn); }
    function val(el) { return el && typeof el.value === 'string' ? el.value : ''; }
    function escapeText(s) {
        return String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
    }
    function escapeAttr(s) {
        return String(s == null ? '' : s).replace(/["'<>]/g, (c) => ({ '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' })[c]);
    }

    /* ---------- 工具：聊天正文插入与聊天状态判定 ---------- */
    function hasOpenChat() {
        try {
            if (typeof TH.getLastMessageId !== 'function') return false;
            const lastId = TH.getLastMessageId();
            if (typeof lastId !== 'number' || lastId < 0) return false;
            return true;
        } catch (e) { return false; }
    }

    function requireOpenChat(reason) {
        if (!hasOpenChat()) {
            toast('尚未进入可读取的酒馆聊天' + (reason ? '：' + reason : '') + '。请先进入任意聊天。', 'error');
            return false;
        }
        return true;
    }

    async function insertIntoChat(title, detail, kind) {
        if (!hasOpenChat()) { toast('当前没有可写入的聊天正文，本次操作未写入。', 'error'); return false; }
        try {
            const lastId = TH.getLastMessageId();
            if (typeof lastId !== 'number' || lastId < 0) {
                toast('当前聊天没有楼层，请先发送一条消息再操作。', 'error'); return false;
            }
            const msgs = TH.getChatMessages(lastId);
            const m = msgs && msgs[0];
            if (!m) { toast('读取最近楼层失败，正文未写入。', 'error'); return false; }
            const oldText = String(m.message || '');
            const block = '[SYS_PANEL]\n' + String(title || '') + '\n' + String(detail || '') + '\n[/SYS_PANEL]';
            const sep = oldText && !/\n$/.test(oldText) ? '\n\n' : '\n';
            const newText = oldText + sep + block + '\n';
            await TH.setChatMessages([{ message_id: lastId, message: newText }], { refresh: 'affected' });

            /* 填入静默指令：输入框内无 [SYS_PANEL] 则填 */
            const sysName = state.system.name || '系统面板';
            const isTask = kind === 'task';
            const isDraw = kind === 'draw';
            const isExcl = kind === 'excl';
            const isDecomp = kind === 'decompose';
            try {
                const ta = window.parent && window.parent.document && window.parent.document.querySelector('#send_textarea');
                if (ta && ta.value.indexOf('[SYS_PANEL]') < 0) {
                    if (isTask) ta.value = '（上文文末[SYS_PANEL]标签内的任务是我在系统' + sysName + '接收的任务，请你合理地将这个剧情插入正文）';
                    else if (isDraw) ta.value = '（上文文末[SYS_PANEL]标签内的物品是我在系统' + sysName + '抽奖获得的物品，请你合理地将这个剧情插入正文，并将这些物品纳入变量中）';
                    else if (isExcl) ta.value = '（上文文末[SYS_PANEL]标签内的结果是系统' + sysName + '专属功能的执行结果，请你合理地将这个剧情插入正文）';
                    else if (isDecomp) ta.value = '（上文文末[SYS_PANEL]标签内的内容是系统' + sysName + '中分解物品的结果，请你合理地将这个剧情插入正文）';
                    else ta.value = '（上文文末[SYS_PANEL]标签内的物品是我在系统' + sysName + '购买获得的物品，请你合理地将这个剧情插入正文，并将这些物品纳入变量中）';
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } catch (e) {}
            return true;
        } catch (e) {
            console.warn('[自定义系统] 插入正文失败：', e);
            toast('插入正文失败：' + (e && e.message || e), 'error');
            return false;
        }
    }

    /* ---------- 工具：世界书摘要 ---------- */
    function summarizeWorldbook(name, entries) {
        const list = Array.isArray(entries) ? entries : [];
        if (!list.length) return '世界书「' + name + '」为空。';
        const parts = [];
        for (const e of list) {
            const title = (e && (e.name || e.comment)) || '未命名';
            const raw = (e && e.content) || '';
            const content = String(raw).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            const preview = content.slice(0, 120) + (content.length > 120 ? '…' : '');
            parts.push('【' + title + '】' + preview);
        }
        return '世界书「' + name + '」共 ' + list.length + ' 条:\n' + parts.slice(0, 12).join('\n');
    }

    /* ---------- 工具：HTTP ---------- */
    function normalizeBase(url) {
        return String(url || '').replace(/\/+$/, '').replace(/\/chat\/completions$/i, '').replace(/\/models$/i, '');
    }
    async function safeRead(res) { try { return await res.text(); } catch (e) { return ''; } }

    async function apiListModels(st) {
        const base = normalizeBase(st.api.url);
        if (!base) throw new Error('未填写接口地址');
        const res = await fetch(base + '/models', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + st.api.key, 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await safeRead(res)).slice(0, 200));
        const data = await res.json().catch(() => ({}));
        const arr = Array.isArray(data.data) ? data.data : (Array.isArray(data.models) ? data.models : (Array.isArray(data) ? data : []));
        const names = arr.map((m) => typeof m === 'string' ? m : (m && (m.id || m.name)) || '').filter(Boolean);
        if (!names.length) throw new Error('接口未返回模型列表');
        return Array.from(new Set(names));
    }

    async function apiChat(st, opts) {
        const base = normalizeBase(st.api.url);
        if (!base) throw new Error('未填写接口地址');
        if (!st.api.model) throw new Error('未选择模型');
        const messages = [];
        if (opts.system) messages.push({ role: 'system', content: opts.system });
        messages.push({ role: 'user', content: opts.user });
        const body = {
            model: st.api.model, messages,
            temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.85,
            max_tokens: Math.min(opts.maxTokens || 1400, (st.api && st.api.maxTokens) ? st.api.maxTokens : 128000)
        };
        if (opts.json) body.response_format = { type: 'json_object' };
        const res = await fetch(base + '/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + st.api.key, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await safeRead(res)).slice(0, 300));
        const data = await res.json().catch(() => ({}));
        const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (typeof text !== 'string') throw new Error('接口未返回有效文本');
        return text;
    }

    function extractJson(text) {
        const raw = String(text || '').trim();
        if (!raw) return {};
        let s = raw;
        const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (fence) s = fence[1];
        const tryParse = (x) => { try { return JSON.parse(x); } catch (e) { return undefined; } };
        for (const open of ['{', '[']) {
            const close = open === '{' ? '}' : ']';
            const start = s.indexOf(open);
            if (start < 0) continue;
            let depth = 0, end = -1, inStr = false, esc = false;
            for (let i = start; i < s.length; i++) {
                const c = s[i];
                if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
                if (c === '"') { inStr = true; continue; }
                if (c === open) depth++;
                else if (c === close) { depth--; if (depth === 0) { end = i; break; } }
            }
            if (end > start) { const r = tryParse(s.slice(start, end + 1)); if (r !== undefined) return r; }
        }
        const r = tryParse(s.trim());
        if (r !== undefined) return r;
        return {};
    }

    /* ---------- 业务：模型上下文 ---------- */
    function getChatHistory(maxCount) {
        maxCount = maxCount || 20;
        try {
            var ctx = window.parent.SillyTavern.getContext();
            var chat = ctx.chat || [];
            var result = [];
            var len = chat.length;
            var start = Math.max(0, len - maxCount);
            for (var i = start; i < len; i++) {
                var msg = chat[i];
                if (msg && msg.mes) {
                    var content = String(msg.mes || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    if (content) {
                        result.push({
                            role: msg.is_user ? (ctx.name1 || '用户') : '正文叙事',
                            content: content
                        });
                    }
                }
            }
            return result;
        } catch (e) { return []; }
    }
    function chatHistoryContext(maxCount) {
        maxCount = maxCount || 15;
        var msgs = getChatHistory(maxCount);
        if (!msgs.length) return '';
        var lines = [];
        for (var i = 0; i < msgs.length; i++) {
            lines.push(msgs[i].role + '：' + msgs[i].content.slice(0, 250));
        }
        return '最近聊天记录（' + msgs.length + ' 条）：\n' + lines.join('\n');
    }
    function worldbookContext(st) {
        const wb = st.worldbook || {};
        if (!wb.name) return '';
        return '已读取的世界书：' + wb.name + '\n世界书摘要：\n' + (wb.summary || '');
    }
    function userContext() {
        const user = getUserBinding();
        const parts = ['绑定的酒馆 USER：' + user.name];
        if (user.description) parts.push('USER Persona：' + user.description.slice(0, 800));
        parts.push('绑定规则：系统只绑定当前酒馆 USER，禁止绑定或继承任何 CHAR 角色卡身份。');
        return parts.join('\n');
    }
    function systemContext(st) {
        return [
            '系统名称：' + st.system.name,
            '系统核心：' + st.system.purpose,
            '系统简介：' + (st.system.summary || ''),
            userContext(),
            worldbookContext(st),
            (function(){var ch=chatHistoryContext(state.contextFloors || 10);return ch?'【当前正文上下文】\n'+ch:'';})()
        ].filter(Boolean).join('\n');
    }

    /* ---------- 业务：初始化系统 ---------- */
    async function apiInitSystem(st) {
        const sys = '你是系统初始化助手。系统身份必须绑定当前酒馆 USER，严禁绑定或继承任何 CHAR 角色卡身份。根据 USER Persona、世界书与聊天正文生成初始化数据。必须严格输出 JSON。';
        const user = `请为以下系统生成初始化信息，只返回 JSON：
{
  "summary": "1-3 句系统简介，体现氛围与玩法，应贴合世界书背景",
  "greeting": "系统开场问候，第一人称，2-4 句，不超过120字",
  "initialPoints": 0
}
系统名称：${st.system.name}
核心作用：${st.system.purpose}
${st.worldbook.name ? worldbookContext(st) : ''}
${userContext()}
注意：initialPoints 为整数，默认 0，范围 0~3000。简介与问候要贴合 USER Persona、世界书与正文剧情氛围，但不得把 CHAR 当作系统绑定对象。只返回JSON。`;
        const text = await apiChat(st, { system: sys, user, json: false, temperature: 0.8, maxTokens: 1500 });
        const obj = extractJson(text);
        return {
            summary: String(obj.summary || '').trim(),
            greeting: String(obj.greeting || '').trim(),
            initialPoints: Math.max(0, Math.min(99999, Math.floor(Number(obj.initialPoints) || 0)))
        };
    }

    /* ---------- 业务：任务 ---------- */
    async function apiGenerateTask(st, opts) {
        const sys = '你是一个系统任务生成器，根据系统设定与世界观生成任务列表。必须严格输出 JSON 对象，键为 tasks，值为数组。';
        const user = `${systemContext(st)}
${opts && opts.first ? '请生成 2~4 个适合系统开局的初始任务。' : '请生成 2~4 个系统任务，难度递增。'}
每个任务字段：name（任务名称）、desc（任务介绍）、goal（任务目标）、reward（完成奖励积分，整数 50~600）、itemReward（可选，完成奖励道具名，可空字符串）。
其中第一个任务建议为引导类简单任务。任务难度与奖励只参考当前 USER 在正文剧情中的进度与能力表现；CHAR 仅是正文叙事参与者，不是系统绑定对象。只返回 JSON：{"tasks":[{"name":"","desc":"","goal":"","reward":0,"itemReward":""}]}`;
        const text = await apiChat(st, { system: sys, user, json: false, temperature: 0.85, maxTokens: 1100 });
        const obj = extractJson(text);
        const arr = obj.tasks || (Array.isArray(obj) ? obj : []);
        return arr.filter(Boolean).map((t) => ({
            id: makeId('task'),
            name: String(t.name || '未命名任务').slice(0, 40),
            desc: String(t.desc || '').slice(0, 200),
            goal: String(t.goal || '').slice(0, 120),
            reward: Math.max(1, Math.min(9999, Math.floor(Number(t.reward || 100)))),
            itemReward: String(t.itemReward || '').slice(0, 40),
            status: 'todo',
            rewardClaimed: false
        }));
    }

    /* ---------- 业务：商城 ---------- */
    function normalizeFingerprintText(value) {
        return String(value == null ? '' : value).normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}_]+/gu, '');
    }

    function shopFingerprint(item) {
        return normalizeFingerprintText([item && item.name, item && item.category, item && (item.desc || item.function)].join('|'));
    }

    function normalizeShopItems(items) {
        const validRarity = ['普通', '稀有', '史诗', '传说'];
        return (Array.isArray(items) ? items : []).filter(Boolean).map((it) => ({
            name: String(it.name || '未命名商品').slice(0, 40),
            category: String(it.category || '未分类').slice(0, 20),
            desc: String(it.desc || it.function || '').slice(0, 120),
            cost: Math.max(1, Math.floor(Number(it.cost || it.price || 100))),
            rarity: validRarity.includes(it.rarity) ? it.rarity : '普通'
        })).filter((it) => shopFingerprint(it)).slice(0, 6);
    }

    function rememberShopBatch(st, items) {
        const memory = Array.isArray(st.shopMemory) ? st.shopMemory.map((x) => typeof x === 'string' ? x : x && x.fingerprint).filter(Boolean) : [];
        for (const item of items) memory.push(shopFingerprint(item));
        st.shopMemory = Array.from(new Set(memory)).slice(-180);
    }

    function fallbackShopItems(st, forbidden) {
        const catalog = [
            ['星屑止血贴','消耗品','快速处理轻度创伤并抑制感染'],['雾航定位针','奇物','在低能见度环境标注安全返程方向'],
            ['折叠净水囊','生存工具','过滤一日份饮水并保留必要矿物质'],['静电破锁片','工具','一次性干扰低阶电子门锁'],
            ['月白储能扣','材料','为小型设备补充稳定能源'],['回声记录珠','奇物','保存并回放一段关键环境声音'],
            ['微光侦察蝶','装备','短时巡查拐角并回传模糊影像'],['应急体温毯','消耗品','抵御严寒并降低体力消耗'],
            ['磁轨攀援索','装备','吸附金属表面完成快速攀援'],['旧城通行章','奇物','提高与中立商队交涉的可信度'],
            ['晨露清醒剂','消耗品','缓解疲劳并保持短时专注'],['符文隔音棉','材料','削弱小范围内的声音外泄'],
            ['便携修复胶','材料','临时修补护具与机械裂口'],['风向测绘镜','工具','读取气流变化并提示隐蔽通道'],
            ['脉冲照明棒','消耗品','释放无明火的高亮冷光'],['余烬保温盒','生存工具','长时间保存食物温度与气味'],
            ['谐振解码叉','工具','辅助识别简单声纹和机械频率'],['薄雾伪装披肩','装备','在静止时弱化轮廓与反光'],
            ['青铜契约笔','奇物','让双方签下的短期约定留下可见印记'],['速记战术卡','技能书','记录并复盘一次小队行动失误'],
            ['重力平衡环','装备','减轻负重造成的行动迟滞'],['夜巡无声靴垫','装备','降低硬质地面的脚步声'],
            ['灵感索引册','技能书','整理零散线索并标出潜在关联'],['晶格防潮盒','工具','保护药剂与精密零件免受湿气影响'],
            ['逆风火种匣','生存工具','在强风中点燃稳定火种'],['简易护心铭牌','装备','抵消一次轻度精神冲击'],
            ['蓝纹地图膜','材料','把手绘地图临时防水并增强标记'],['蜂鸣诱饵器','工具','在远处制造可控声源吸引注意'],
            ['便携药草研钵','工具','提升基础草药的现场处理效率'],['残光信标','奇物','在撤离路线留下仅持有者可见的微光标记']
        ];
        const out = [];
        const start = Math.abs(Date.now() + Number(st.points || 0)) % catalog.length;
        for (let i = 0; i < catalog.length && out.length < 6; i++) {
            const row = catalog[(start + i) % catalog.length];
            const item = { name: row[0], category: row[1], desc: row[2], cost: 60 + ((start + i) % 9) * 45, rarity: (i % 7 === 0 ? '稀有' : '普通') };
            const fp = shopFingerprint(item);
            if (!forbidden.has(fp)) { forbidden.add(fp); out.push(item); }
        }
        while (out.length < 6) {
            const serial = Date.now().toString(36) + '-' + out.length;
            const item = { name: '异域补给·' + serial, category: '奇物', desc: '来自临时交易节点的密封未知补给', cost: 120 + out.length * 35, rarity: '稀有' };
            if (!forbidden.has(shopFingerprint(item))) out.push(item);
        }
        return out;
    }

    async function apiGenerateShop(st) {
        const sys = '你是一个系统商城生成器，负责生成符合世界观的商品列表。必须严格输出 JSON 对象，键为 products，值为数组。';
        var pts = st.points || 0;
        const previous = new Set((st.shop || []).map(shopFingerprint).filter(Boolean));
        const history = new Set((st.shopMemory || []).map((x) => typeof x === 'string' ? x : x && x.fingerprint).filter(Boolean));
        previous.forEach((fingerprint) => history.add(fingerprint));
        st.shopMemory = Array.from(history).slice(-180);
        const forbidden = new Set([...previous, ...history]);
        const bannedNames = (st.shop || []).concat([]).map((x) => x && x.name).filter(Boolean).concat(
            (st.shopMemory || []).filter((x) => x && typeof x === 'object' && x.name).map((x) => x.name)
        ).slice(-80);
        let lastError = null;
        for (let attempt = 1; attempt <= 4; attempt++) {
            try {
                var user = `${systemContext(st)}
当前积分：${pts}
请生成 6 件商品，每件包含字段：name（名称）、category（类别，如"消耗品/装备/材料/技能书/奇物"）、desc（一句话作用描述）、cost（购买积分，整数）、rarity（稀有度，取值：普通/稀有/史诗/传说）。
定价原则：根据上文聊天正文判断当前 USER 的剧情阶段——初期以低价普通/稀有商品为主，后期才允许高价高稀有度商品。CHAR 只作为正文参与者，不得成为商城绑定身份。商品必须贴合 USER 的剧情进度。只返回 JSON：{"products":[{"name":"","category":"","desc":"","cost":0,"rarity":""}]}
严禁出现以下上一批或近期商品（名称、类别、作用近似也视为重复）：${bannedNames.length ? bannedNames.join('、') : '无'}
这是第 ${attempt} 次唯一性生成，随机因子 ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}。六件商品彼此也不得重复。`;
                const text = await apiChat(st, { system: sys, user, json: false, temperature: Math.min(1.2, .92 + attempt * .06), maxTokens: 1300 });
                const obj = extractJson(text);
                const raw = obj.products || obj.shop || obj.items || (Array.isArray(obj) ? obj : []);
                const items = normalizeShopItems(raw);
                if (items.length !== 6) throw new Error('商城返回商品数量不是 6 件');
                const fingerprints = items.map(shopFingerprint);
                if (new Set(fingerprints).size !== 6) throw new Error('商城返回批次内部存在重复商品');
                if (fingerprints.some((fp) => forbidden.has(fp))) throw new Error('商城返回与上一批或近期历史重复的商品');
                rememberShopBatch(st, items);
                setDebugHealth('shop', true, '严格去重通过 · 第 ' + attempt + ' 次');
                return items;
            } catch (e) {
                lastError = e;
            }
        }
        const fallback = fallbackShopItems(st, forbidden);
        rememberShopBatch(st, fallback);
        recordDebugError('商城去重', lastError || new Error('模型重复生成'), '四次重试后启用本地唯一候选');
        setDebugHealth('shop', true, '模型重复时已启用本地唯一兜底');
        return fallback;
    }

    /* ---------- 业务：抽奖 ---------- */
    async function apiGenerateDraw(st, count) {
        const n = count === 10 ? 10 : 1;
        const sys = '你是一个抽奖系统，根据世界观生成奖励物品。必须严格输出 JSON 对象，键为 items，值为数组。';
        const user = `${systemContext(st)}
请生成 ${n} 个抽奖奖励物品，每个字段：name（名称）、category（类别）、desc（一句话说明）、rarity（稀有度取值：普通/稀有/史诗/传说/神话）。
稀有度概率：绝大多数为普通/稀有，史诗约10%，传说约3%，神话仅约1%极低概率（${n > 1 ? '十连保底至少 1 个稀有' : '无保底'}）。普通物品应为日常杂物/消耗品，不要每个都起花哨名字。只返回 JSON：{"items":[{"name":"","category":"","desc":"","rarity":""}]}`;
        const text = await apiChat(st, { system: sys, user, json: false, temperature: 1.0, maxTokens: n === 10 ? 1400 : 300 });
        const obj = extractJson(text);
        const arr = obj.items || obj.results || (Array.isArray(obj) ? obj : []);
        const valid = ['普通', '稀有', '史诗', '传说', '神话'];
        return arr.filter(Boolean).slice(0, n).map((it) => ({
            name: String(it.name || '未知物品').slice(0, 40),
            category: String(it.category || '').slice(0, 20),
            desc: String(it.desc || '').slice(0, 120),
            rarity: valid.includes(it.rarity) ? it.rarity : '普通'
        }));
    }

    /* ---------- 业务：专属功能（纯AI·重试·零硬编码）---------- */
    async function apiRefreshExclCost(st, ef) {
        var ch = getChatHistory(st.contextFloors || 10);
        var chatCtx = '';
        if (ch.length) {
            var lines = [];
            for (var i = 0; i < Math.min(ch.length, 10); i++) {
                lines.push(ch[i].role + '：' + ch[i].content.slice(0, 180));
            }
            chatCtx = '\n近期剧情：\n' + lines.join('\n');
        }
        var pts = st.points || 0;
        var text = await apiChat(st, {
            system: '你是系统设计师，根据当前 USER 的正文剧情进度与积分余额判断专属功能的合理花费积分。只返回一个整数，不要任何额外文字；严禁把 CHAR 作为系统绑定身份。',
            user: '当前积分：' + pts + '。系统名称：' + (st.system.name || '') + '。功能名：' + (ef.name || '') + chatCtx + '\n请输出一个合理的花费积分整数：',
            temperature: 0.5, maxTokens: 10
        });
        var num = parseInt(String(text).match(/\d+/));
        return isNaN(num) ? Math.floor(pts * 0.15) || 80 : Math.max(1, num);
    }

async function apiGenerateExclusive(st, pref, complexity){
    complexity = complexity || 'simple';
    var isComplex = complexity === 'complex';
    var sn=st.system.name||'系统';var sp=st.system.purpose||'';
    var prefText=(typeof pref==='string'?pref:'').trim();
    var wb=st.worldbook||{};
    var wbCtx=wb.name&&wb.summary?('世界书《'+wb.name+'》设定：'+(wb.summary||'').slice(0,400)+'。'):'';
    var bias=prefText?('\n请严格按照以下提示词设计此功能：'+prefText.slice(0,300)):(wbCtx?('\n请参考以下世界观设定设计功能：'+wbCtx):'');
    var name='',icon='',desc='',html='',actions=[];
    for(var attempt=0;attempt<3;attempt++){
        try{
            var r=await apiChat(st,{system:'你是系统UI设计师。只输出一行JSON，不要markdown。html字段为合法HTML片段（不含script）。你必须严格遵循用户提示词或世界书世界观生成功能，禁止擅自改变功能方向，严禁生成情色/成人/擦边内容，除非用户提示词明确要求，否则不得出现任何性暗示或色情相关功能。禁止签到/抽卡/召唤/商店等模板。【最重要】所有可交互元素（按钮、链接、卡片、图标等）必须带data-excl-act属性，属性值为该操作的中文动作名，点击后会自动触发对应逻辑并静默执行，绝对不能有无法点击的假按钮或装饰按钮。',
            user:'为系统"'+sn+'"（'+sp.slice(0,90)+'）生成专属交互功能JSON：{"name":"≤6字功能名","icon":"1个emoji","desc":"≤12字描述","cost":0,"actions":["操作A","操作B","操作C"],"html":"<div>信息展示+操作按钮HTML</div>"}\ncost要求：'+(state.exclCostPoints?'cost字段为功能总花费参考值（整数）。每个操作按钮必须在按钮文字旁写明该按钮的具体花费积分（如：升级(500积分)），并在HTML中用data-excl-cost=\"N\"标注实际扣费值。不同按钮可以有不同花费，由你根据功能强度自行定价。':'cost字段固定为0')+'\nhtml要求：'+(isComplex?'800~3000字，必须包含<style>标签实现复杂CSS样式（动画/渐变/卡片布局/悬浮效果/响应式等），可自定义class名，使用纯CSS实现视觉冲击力的交互界面':'150~400字，class从')+'nlsp-card nlsp-page-sub nlsp-pt nlsp-section-title nlsp-btn nlsp-grid3 nlsp-tags nlsp-result nlsp-banner nlsp-row nlsp-center中自由选用，颜色用var(--t-accent) var(--t-text) var(--t-title) var(--t-cardBg) var(--t-warn) var(--t-success) var(--t-err) var(--t-pur)，{% points %}占位积分。【点击逻辑要求】所有按钮、链接、可交互卡片、图标必须带data-excl-act=\"中文动作名\"属性，data-excl-msg=\"点击后显示的提示\"可选。禁止生成任何无法点击的装饰按钮。每个data-excl-act元素点击后会自动静默触发对应逻辑。'+bias,
            temperature:1.0,maxTokens:isComplex?30000:2000});
            var d=extractJson(r);
            if(d.name&&d.icon&&Array.isArray(d.actions)&&d.actions.length&&d.actions[0]&&d.html&&d.html.length>30){
                name=d.name;icon=d.icon;desc=d.desc;actions=d.actions;html=d.html;var cost=Number(d.cost)||0;break;
            }
        }catch(e){}
    }
    name=String(name||'').slice(0,20)||sn.slice(0,6);
    icon=String(icon||'').slice(0,4)||'✨';
    desc=String(desc||'').slice(0,40)||sp.slice(0,12);
    if(!actions.length)actions=[];for(var i=0;i<actions.length;i++)actions[i]=String(actions[i]||'').slice(0,10);
    if(!html||html.length<30){
        var btnHtml='';for(var j=0;j<actions.length;j++){btnHtml+='<button class="nlsp-btn" data-excl-act="'+actions[j]+'" style="margin:6px">'+actions[j]+'</button>';}
        html='<div class="nlsp-result"><div class="nlsp-section-title">'+name+'</div><div class="nlsp-page-sub">'+desc+'</div><div style="font-size:22px;color:var(--t-accent);font-weight:700;margin:8px 0">{% points %}</div>'+btnHtml+'</div>';
    }
    html=String(html).replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=/gi,' data-blocked=');
    if (state.exclCostPoints && (!cost || cost < 1)) {
        var costMatch = String(html || '').match(/(?:花费|消耗|扣|cost|积分)[^0-9]*(\d{2,6})/i);
        cost = costMatch ? parseInt(costMatch[1]) : 0;
    }
    return{name:name,icon:icon,desc:desc,cost:cost||0,actions:actions,html:html+'<div id="nlsp-excl-status" class="nlsp-page-sub" style="margin-top:10px;min-height:16px"></div>'};
}

    /* ---------- 业务：系统对话 ---------- */
    async function apiChatReply(st, userText) {
        const sys = [
            '你是当前系统的功能助手，直接、自然地回应绑定 USER 的问题。',
            '系统名称：' + st.system.name + '（核心：' + st.system.purpose + '）',
            userContext(),
            st.worldbook.name ? worldbookContext(st) : '',
            '规则：只绑定酒馆 USER，严禁把任何 CHAR 当作系统身份；单次回复 60~200 字。'
        ].filter(Boolean).join('\n');
        const msgs = [];
        const history = (st.chat || []).filter((m) => m.role !== 'system' || m.content === '正在思考…').slice(-10);
        for (const m of history) {
            if (m.role === 'user') msgs.push({ role: 'user', content: m.content });
            else if (m.role === 'assistant') msgs.push({ role: 'assistant', content: m.content });
        }
        msgs.push({ role: 'user', content: userText });
        return apiChatMessages(st, sys, msgs, { temperature: 0.85, maxTokens: 600 });
    }

    async function apiChatMessages(st, system, messages, opts) {
        const base = normalizeBase(st.api.url);
        if (!base) throw new Error('未填写接口地址');
        if (!st.api.model) throw new Error('未选择模型');
        const body = {
            model: st.api.model,
            messages: [system ? { role: 'system', content: system } : null, ...messages].filter(Boolean),
            temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.85,
            max_tokens: opts.maxTokens || 1400
        };
        const res = await fetch(base + '/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + st.api.key, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await safeRead(res)).slice(0, 300));
        const data = await res.json().catch(() => ({}));
        const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (typeof text !== 'string') throw new Error('接口未返回有效文本');
        return text;
    }

    function installInternalErrorCapture() {
        if (window.__nlspErrorCaptureInstalled) return;
        window.__nlspErrorCaptureInstalled = true;
        const internal = /自定义系统|nlsp|NailongSystemPanel|settleTasksFromContext|apiGenerateShop|apiGenerateTask|renderDebugBody|doAutoRefresh/i;
        window.addEventListener('error', (event) => {
            const stack = String(event && event.error && event.error.stack || '');
            const source = String(event && event.filename || '');
            const message = String(event && event.message || '');
            if (internal.test(stack + ' ' + source + ' ' + message)) recordDebugError('脚本异常', event.error || message, source || 'window.error');
        });
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event && event.reason;
            const text = String(reason && reason.stack || reason || '');
            if (internal.test(text)) recordDebugError('未处理 Promise', reason || text, 'unhandledrejection');
        });
    }

    /* ---------- 全局暴露 ---------- */
    window.NailongSystemPanel = {
        toggle() { const doc = getDoc(); if (doc.getElementById(OVERLAY_ID)) { closePanel(); } else { openPanel(); } },
        open() { openPanel(); },
        close() { closePanel(); }
    };

    /* ---------- 正文事件与自动结算 / 自动刷新 ---------- */
    var runtimeEventDisposers = [];
    var runtimePollTimer = null;
    var taskSettlementRunning = false;
    var refreshCounter = 0;
    var lastRefreshFingerprint = '';

    function fingerprintText(value) {
        let hash = 2166136261;
        const input = String(value || '');
        for (let i = 0; i < input.length; i++) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 16777619) >>> 0; }
        return hash.toString(16).padStart(8, '0');
    }

    function cleanNarrativeText(value) {
        return String(value || '')
            .replace(/\[SYS_PANEL\][\s\S]*?\[\/SYS_PANEL\]/gi, ' ')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(-12000);
    }

    async function readLatestNarrativeContext(limit) {
        const count = Math.max(2, Math.min(20, Number(limit) || 8));
        try {
            if (typeof TH.getChatMessages === 'function') {
                const result = await Promise.resolve(TH.getChatMessages('0-{{lastMessageId}}', { role: 'all', hide_state: 'all' }));
                if (Array.isArray(result) && result.length) {
                    return result.slice(-count).map((msg) => cleanNarrativeText(
                        typeof msg === 'string' ? msg : (msg.message || msg.mes || msg.text || '')
                    )).filter(Boolean).join('\n');
                }
            }
        } catch (e) {
            recordDebugError('正文读取', e, 'TavernHelper.getChatMessages');
        }
        const fallback = getChatHistory(count);
        return fallback.map((msg) => cleanNarrativeText(msg.content)).filter(Boolean).join('\n');
    }

    function taskKeywords(task) {
        const stop = new Set(['任务','完成','进行','目标','获得','一次','当前','系统','玩家','需要','成功','以及','然后','相关']);
        const source = String((task && task.name) || '') + ' ' + String((task && task.goal) || '');
        const words = source.match(/[\p{Script=Han}]{2,8}|[A-Za-z0-9]{3,}/gu) || [];
        return Array.from(new Set(words.map(normalizeFingerprintText).filter((word) => word && !stop.has(word)))).slice(0, 12);
    }

    function quickTaskMatches(text, tasks) {
        const normalized = normalizeFingerprintText(text);
        const completionCue = /(?:任务(?:已经|已|顺利)?完成|已完成|完成了|达成(?:了)?(?:目标|条件)|成功(?:完成|达成|交付|提交)|顺利(?:完成|交付|提交)|目标已达成|宣告完成)/u;
        if (!completionCue.test(text)) return [];
        return tasks.filter((task) => {
            const name = normalizeFingerprintText(task.name || '');
            const keywords = taskKeywords(task);
            const anchored = (name.length >= 3 && normalized.includes(name)) || keywords.some((word) => word.length >= 2 && normalized.includes(word));
            return anchored || tasks.length === 1;
        }).map((task) => ({ id: task.id, confidence: 1, evidence: '正文出现明确完成措辞并命中任务关键词' }));
    }

    async function aiTaskMatches(text, tasks) {
        if (!state.connected || !state.api || !state.api.url || !state.api.model) return [];
        const relatedCue = /(?:完成|达成|成功|交付|提交|解决|修复|击败|抵达|找到|取得|救出|通过|结束)/u;
        if (!relatedCue.test(text)) return [];
        const payload = tasks.map((task) => ({ id: task.id, name: task.name, goal: task.goal }));
        const response = await apiChat(state, {
            system: '你是任务完成判定器。只根据已经发生的正文事实判断，不因计划、准备、接受任务或假设而判定完成。只返回 JSON。',
            user: '进行中的任务：' + JSON.stringify(payload) + '\n最近正文：' + text.slice(-7000) + '\n返回 {"completed":[{"id":"任务id","confidence":0到1,"evidence":"不超过60字的正文依据"}]}。没有完成则 completed 为空数组。',
            json: false,
            temperature: 0.1,
            maxTokens: 500
        });
        const parsed = extractJson(response);
        return (Array.isArray(parsed.completed) ? parsed.completed : []).map((item) => ({
            id: String(item.id || ''),
            confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0)),
            evidence: String(item.evidence || '').slice(0, 240)
        }));
    }

    async function settleTasksFromContext(eventText, source) {
        if (!state.autoTaskSettlement || taskSettlementRunning) return false;
        const doing = (state.tasks || []).filter((task) => task && task.status === 'doing' && !task.rewardClaimed);
        if (!doing.length) { setDebugHealth('taskSettlement', true, '监听正常 · 当前无进行中任务'); return false; }
        taskSettlementRunning = true;
        try {
            const context = cleanNarrativeText(eventText) || await readLatestNarrativeContext(state.contextFloors || 10);
            if (!context) throw new Error('未读取到可判定的正文内容');
            const fp = fingerprintText(context);
            if (fp === state.lastTaskContextFingerprint) return false;
            let matches = quickTaskMatches(context, doing);
            if (!matches.length) matches = await aiTaskMatches(context, doing);
            const minConfidence = Number(state.taskSettlementMinConfidence) || .78;
            const settledIds = [];
            for (const match of matches) {
                if (Number(match.confidence) < minConfidence) continue;
                const task = doing.find((item) => String(item.id) === String(match.id));
                if (task && settleTask(task, { source: source || '正文事件', evidence: match.evidence })) settledIds.push(task.id);
            }
            state.lastTaskContextFingerprint = fp;
            state.taskSettlementHistory.push({ time: Date.now(), fingerprint: fp, source: String(source || '正文事件'), taskIds: settledIds });
            state.taskSettlementHistory = state.taskSettlementHistory.slice(-80);
            setDebugHealth('taskSettlement', true, settledIds.length ? '刚刚结算 ' + settledIds.length + ' 个任务' : '正文检查完成 · 无任务达成');
            saveState();
            return settledIds.length > 0;
        } catch (e) {
            recordDebugError('任务结算器', e, source || '正文事件');
            setDebugHealth('taskSettlement', false, e && e.message || String(e));
            return false;
        } finally {
            taskSettlementRunning = false;
        }
    }

    function runtimeValue(name) {
        try {
            if (name === 'eventOn' && typeof eventOn === 'function') return eventOn;
            if (name === 'tavern_events' && typeof tavern_events === 'object') return tavern_events;
            if (name === 'iframe_events' && typeof iframe_events === 'object') return iframe_events;
        } catch (e) {}
        const realms = [window];
        try { if (window.parent && window.parent !== window) realms.push(window.parent); } catch (e) {}
        for (const realm of realms) {
            try { if (realm && realm[name] != null) return realm[name]; } catch (e) {}
        }
        return null;
    }

    function normalizeDisposer(value) {
        if (typeof value === 'function') return value;
        if (value && typeof value.stop === 'function') return () => value.stop();
        return () => {};
    }

    function handleNarrativeEvent(source, text) {
        Promise.resolve(settleTasksFromContext(text, source)).catch((e) => recordDebugError('任务结算器', e, source));
        if (!state.autoRefresh || !state.initialized || !state.connected) return;
        Promise.resolve(cleanNarrativeText(text) || readLatestNarrativeContext(4)).then((value) => {
            const fp = fingerprintText(value);
            if (!value || fp === lastRefreshFingerprint) return;
            lastRefreshFingerprint = fp;
            refreshCounter++;
            if (refreshCounter >= Math.max(1, Number(state.refreshInterval) || 1)) { refreshCounter = 0; doAutoRefresh(); }
        }).catch((e) => recordDebugError('自动刷新', e, source));
    }

    function clearRuntimeEvents() {
        for (const dispose of runtimeEventDisposers.splice(0).reverse()) { try { dispose(); } catch (e) {} }
        if (runtimePollTimer) { clearInterval(runtimePollTimer); runtimePollTimer = null; }
    }

    function setupAutoRefresh() {
        clearRuntimeEvents();
        const eventOnFn = runtimeValue('eventOn');
        const tavern = runtimeValue('tavern_events') || {};
        const iframe = runtimeValue('iframe_events') || {};
        let bound = 0;
        const bindEvent = (name, listener) => {
            if (!eventOnFn || !name) return;
            try { runtimeEventDisposers.push(normalizeDisposer(eventOnFn(name, listener))); bound++; }
            catch (e) { recordDebugError('事件监听', e, String(name)); }
        };
        bindEvent(iframe.GENERATION_ENDED || tavern.GENERATION_ENDED, (text) => handleNarrativeEvent('GENERATION_ENDED', text));
        bindEvent(tavern.MESSAGE_RECEIVED, () => handleNarrativeEvent('MESSAGE_RECEIVED', ''));
        bindEvent(tavern.CHAT_CHANGED, () => {
            const liveUser = getUserBinding();
            if (!state.userBinding || state.userBinding.id !== liveUser.id) {
                state = loadState(); applyTheme(state.theme || 'hl-dark');
                if (overlay()) render();
            }
        });
        if (!bound) {
            let lastPollFingerprint = '';
            runtimePollTimer = setInterval(async () => {
                try {
                    const context = await readLatestNarrativeContext(4);
                    const fp = fingerprintText(context);
                    if (!context || fp === lastPollFingerprint) return;
                    lastPollFingerprint = fp;
                    handleNarrativeEvent('轻量轮询兜底', context);
                } catch (e) { recordDebugError('正文轮询', e, 'fallback'); }
            }, 3000);
        }
        setDebugHealth('events', bound > 0 || !!runtimePollTimer, bound > 0 ? '已绑定 ' + bound + ' 个酒馆事件' : '事件不可用，已启用 3 秒轮询兜底');
    }
    var autoRefreshRunning = false;
    async function doAutoRefresh() {
        if (!state.initialized || !state.connected) return;
        if (autoRefreshRunning) return;
        autoRefreshRunning = true;
        try {
            console.log('[自定义系统] 开始自动刷新任务/商城…');
            var tasks = await apiGenerateTask(state, { first: false });
            if (tasks && tasks.length) { state.tasks = mergeTaskRefresh(tasks); }
            var shop = await apiGenerateShop(state);
            if (shop && shop.length) { state.shop = shop; }
            saveState();
            console.log('[自定义系统] 自动刷新完成: ' + (state.tasks?state.tasks.length:0) + '个任务, ' + (state.shop?state.shop.length:0) + '件商品');
        } catch (e) {
            console.warn('[自定义系统] 自动刷新失败:', e);
            recordDebugError('自动刷新', e, '任务与商城');
        } finally {
            autoRefreshRunning = false;
        }
    }

    /* 监听 JS-Slash-Runner 脚本按钮 */
    try {
        var btnEvt = getButtonEvent('系统面板');
        console.log('[自定义系统] getButtonEvent 返回:', btnEvt, '类型:', typeof btnEvt);
        if (btnEvt) {
            eventOn(btnEvt, function () {
                console.log('[自定义系统] 按钮被点击');
                try {
                    var doc = getDoc();
                    console.log('[自定义系统] getDoc 完成');
                    if (doc.getElementById(OVERLAY_ID)) {
                        console.log('[自定义系统] 面板已打开，关闭');
                        closePanel();
                    } else {
                        console.log('[自定义系统] 面板未打开，打开中');
                        openPanel();
                        console.log('[自定义系统] openPanel 完成');
                    }
                } catch(e) { console.error('[自定义系统] 按钮点击出错:', e); recordDebugError('脚本按钮', e, '点击'); }
            });
            console.log('[自定义系统] 按钮事件注册成功');
        } else {
            console.warn('[自定义系统] 按钮事件为空，注册失败');
        }
    } catch (e) { console.warn('[自定义系统] 脚本按钮注册失败：', e); recordDebugError('脚本按钮', e, '注册'); }

    /* ---------- 启动 ---------- */
    try {
        ensureStyle();
        injectFont();
        installInternalErrorCapture();
        setupAutoRefresh();
    } catch (e) { console.error('[自定义系统] 启动失败：', e); recordDebugError('脚本启动', e, '启动'); }
})();
