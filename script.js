// --- CONFIGURAÇÕES DE NEGÓCIO ---
const PHONE_NUMBER = "5537998125237"; 
const PRECO_UNITARIO = 1.75;
const TIJOLOS_POR_M2 = 64; // Altura 6.25cm exige mais tijolos
const MARGEM_SEGURANCA = 1.05; // 5%

// Variáveis de Estado
let state = {
    area: 0,
    qtdPadrao: 0,
    qtdCanaleta: 0,
    freteInfo: "A consultar",
    totalGeral: 0
};

// --- FUNÇÃO PRINCIPAL: CALCULAR TUDO ---
function calculateTotalBudget() {
    // 1. Captura Inputs
    const areaInput = document.getElementById('wall-area');
    
    let area = parseFloat(areaInput.value);
    
    // Reseta se vazio
    if (!area || area < 0) area = 0;

    // 2. Calcula Quantidades (Física)
    // Regra: 9% Canaletas (aprox 3 fiadas em parede padrão)
    let totalBruto = Math.ceil(area * TIJOLOS_POR_M2);
    let brutoCanaleta = Math.ceil(totalBruto * 0.09); 
    let brutoPadrao = totalBruto - brutoCanaleta;

    // Aplica margem de segurança de 5%
    state.qtdPadrao = Math.ceil(brutoPadrao * MARGEM_SEGURANCA);
    state.qtdCanaleta = Math.ceil(brutoCanaleta * MARGEM_SEGURANCA);
    state.area = area;

    // 3. Calcula Valores (Financeiro)
    let custoPadrao = state.qtdPadrao * PRECO_UNITARIO;
    let custoCanaleta = state.qtdCanaleta * PRECO_UNITARIO;
    let subtotalMateriais = custoPadrao + custoCanaleta;

    // 4. Total Final
    state.totalGeral = subtotalMateriais;

    // 5. Atualiza a Tela (UI)
    updateInterface(custoPadrao, custoCanaleta, subtotalMateriais);
}

// --- ÁREA DE ALVENARIA GUIADA ---
// Tijolos são calculados pela superfície das paredes, não pela área do piso.
function calculateWallArea() {
    const readValue = (id) => {
        const value = parseFloat(document.getElementById(id).value);
        return Number.isFinite(value) && value > 0 ? value : 0;
    };
    const perimeter = readValue('external-perimeter');
    const height = readValue('ceiling-height');
    const internalWalls = readValue('internal-walls');
    const openings = readValue('openings-area');

    const externalArea = perimeter * height;
    const internalArea = internalWalls * height;
    const netArea = Math.max(0, externalArea + internalArea - openings);
    const fmtArea = (value) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`;

    document.getElementById('display-external-area').innerText = fmtArea(externalArea);
    document.getElementById('display-internal-area').innerText = fmtArea(internalArea);
    document.getElementById('display-openings-area').innerText = fmtArea(openings);
    document.getElementById('display-calculated-area').innerText = fmtArea(netArea);

    // Só substitui o campo final quando há medidas suficientes para uma parede.
    // Assim, quem já possui a área no projeto ainda pode preenchê-la diretamente.
    if (height > 0 && (perimeter > 0 || internalWalls > 0)) {
        const areaInput = document.getElementById('wall-area');
        areaInput.value = netArea.toFixed(2);
        calculateTotalBudget();
    }
}

// --- ATUALIZAÇÃO VISUAL (DOM) ---
function updateInterface(custoPadrao, custoCanaleta, subtotal) {
    // Formatação de Moeda
    const fmtMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.getElementById('display-qtd-padrao').innerText = state.qtdPadrao + " un";
    document.getElementById('display-val-padrao').innerText = fmtMoney(custoPadrao);

    document.getElementById('display-qtd-canaleta').innerText = state.qtdCanaleta + " un";
    document.getElementById('display-val-canaleta').innerText = fmtMoney(custoCanaleta);

    document.getElementById('display-subtotal').innerText = fmtMoney(subtotal);
    document.getElementById('display-freight').innerText = state.freteInfo;
    
    // Totalzão em destaque
    document.getElementById('display-grand-total').innerText = fmtMoney(state.totalGeral);
}

// --- ENVIO WHATSAPP ---
function sendBudgetToWhatsapp() {
    if (state.totalGeral === 0) {
        alert("Por favor, preencha a área da parede para gerar o orçamento.");
        document.getElementById('wall-area').focus();
        return;
    }

    const fmtMoney = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    let date = new Date().toLocaleDateString('pt-BR');

    let msg = `Olá, Criar Tijolos! 🧱%0A`;
    msg += `Fiz um orçamento no site dia ${date}:%0A%0A`;
    msg += `*RESUMO DO PEDIDO:*%0A`;
    msg += `📏 Área: ${state.area}m²%0A`;
    msg += `🧱 Tijolos Padrão: ${state.qtdPadrao} un%0A`;
    msg += `🏗️ Canaletas: ${state.qtdCanaleta} un%0A`;
    msg += `📍 Frete: a consultar%0A`;
    msg += `--------------------------------%0A`;
    msg += `💰 *VALOR TOTAL: R$ ${fmtMoney(state.totalGeral)}*%0A`;
    msg += `--------------------------------%0A%0A`;
    msg += `*Observação:* Estou ciente que o frete deve ser consultado separadamente, pois pode variar conforme distância, acesso ao local, quantidade e outros fatores. Gostaria de validar o pedido e combinar o pagamento.`;

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${msg}`, '_blank');
}

// --- EVENTOS GERAIS ---
document.addEventListener('DOMContentLoaded', () => {
    // Menu Mobile
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
    document.querySelectorAll(".nav-link").forEach(l => l.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));

    // FAQ
    document.querySelectorAll(".faq-question").forEach(q => {
        q.addEventListener("click", () => {
            q.parentElement.classList.toggle("active");
        });
    });

    // Scroll Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if(e.isIntersecting) e.target.classList.add('show');
        });
    });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
});

// --- MAPS --- // 
// Configurações do seu local
const local = {
    nome: "Criar Tijolos Ecológicos",
    endereco: "Rua Severo Veloso, 2147 - Piumhi, MG"
};

// Seleciona o botão pelo ID
const botao = document.getElementById('botaoRota');

// Adiciona a função de clique
botao.addEventListener('click', () => {
    // Monta a query de busca (Nome + Endereço)
    const busca = encodeURIComponent(`${local.nome} ${local.endereco}`);
    
    // URL universal do Google Maps para rotas
    const url = `https://www.google.com/maps/dir/?api=1&destination=${busca}`;
    
    // Abre em uma nova aba/janela
    window.open(url, '_blank');
});
