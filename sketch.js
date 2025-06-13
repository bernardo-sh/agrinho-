// Variáveis globais para o estado do campo e da cidade
let campoArea;
let cidadeArea;
let poluicao;
let alimentosProduzidos;
let score; // Variável para armazenar a pontuação do jogo
let bonusAlimentosPorRega = 0; // Bônus de alimentos que vem da rega

// Variáveis para armazenar as posições das árvores e prédios
let trees = [];
let buildings = [];

// Variáveis para o trator
let tractorX;
let tractorY;
let tractorSpeed = 3; // Velocidade do trator
let isHarvesting = false; // Estado para controlar a colheita
let harvestProgress = 0; // Progresso da colheita (0 a 100)
const HARVEST_DURATION = 100; // Quanto tempo leva para colher
const HARVEST_FOOD_BONUS = 50; // Bônus de alimentos ao colher

// Variáveis para o estado do jogo
let gameOver = false;
let gameWon = false;
const MAX_POLUTION = 200; // Limite de poluição para perder
const MIN_FOOD = 20; // Limite mínimo de alimentos para perder
const WIN_SCORE = 2000; // Pontuação para ganhar

function setup() {
  createCanvas(800, 600); // Cria um canvas de 800x600 pixels
  resetGame(); // Inicializa o jogo
}

function resetGame() {
  campoArea = 0.7; // 70% do canvas é campo inicialmente
  cidadeArea = 0.3; // 30% do canvas é cidade inicialmente
  poluicao = 0; // Nível de poluição inicial
  alimentosProduzidos = 0; // Alimentos começam em 0
  score = 0; // Pontuação inicial
  bonusAlimentosPorRega = 0;

  tractorX = 10;
  tractorY = height / 2 + 150; // Posição do trator ajustada para a parte inferior do campo
  isHarvesting = false;
  harvestProgress = 0;

  gameOver = false;
  gameWon = false;
  loop(); // Garante que o loop de desenho recomece
  generateTrees();
  generateBuildings();
}

function draw() {
  if (gameOver || gameWon) {
    displayEndScreen();
    return; // Sai do loop de desenho se o jogo acabou
  }

  background(220); // Fundo cinza claro

  // Desenha o campo
  fill(0, 150, 0); // Verde para o campo
  rect(0, 0, width * campoArea, height);

  // Desenha a cidade
  fill(100); // Cinza para a cidade
  rect(width * campoArea, 0, width * cidadeArea, height);

  // Desenha indicadores visuais (ex: poluição)
  fill(255, 0, 0, poluicao); // Vermelho transparente para a poluição
  rect(width * campoArea, 0, width * cidadeArea, height); // Sobrepõe a área da cidade

  // Desenha elementos visuais adicionais
  drawPlantations(); // Desenha as plantações na área do campo
  drawTrees(); // Desenha as árvores na área do campo (usando posições fixas)
  drawBuildings(); // Desenha os prédios na área da cidade (usando posições fixas)
  drawConnection(); // Desenha a conexão entre o campo e a cidade (agora uma rua curva)
  drawFactory(); // Desenha a indústria/fábrica conectando as áreas
  drawTractor(); // Desenha e anima o trator

  // Lógica de cálculo de alimentos
  let alimentosBase = campoArea * 150; // Ex: se campoArea for 1 (100%), 150 alimentos base
  alimentosProduzidos = alimentosBase + bonusAlimentosPorRega;
  alimentosProduzidos = constrain(alimentosProduzidos, 0, 200); // Limite máximo de alimentos (ajustado)

  // Atualiza a pontuação
  score = (campoArea * 100) + (alimentosProduzidos * 2) - (cidadeArea * 100) - (poluicao * 0.5);
  score = floor(score); // Arredonda a pontuação para um número inteiro

  // Desenha indicadores visuais (ex: produção de alimentos e pontuação)
  fill(255); // Cor branca para o texto
  textSize(20); // Tamanho da fonte
  text("Alimentos: " + floor(alimentosProduzidos), 10, 30); // Exibe a quantidade de alimentos
  text("Pontos: " + score, 10, 60); // Exibe a pontuação
  text("Poluição: " + floor(poluicao), 10, 90); // Exibe o nível de poluição

  // Exibe instruções
  fill(0); // Cor preta para o texto
  textSize(16); // Tamanho da fonte
  text("Clique no mouse para expandir a cidade", 10, height - 60);
  text("Pressione 'W' para regar as plantações", 10, height - 40);
  text("Pressione 'S' para usar o trator e colher", 10, height - 20);

  // Verifica condições de vitória/derrota
  checkGameConditions();
}

function mousePressed() {
  if (gameOver || gameWon) {
    if (mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > height / 2 + 50 && mouseY < height / 2 + 80) {
      resetGame(); // Reinicia o jogo se o botão for clicado
    }
    return;
  }

  // Simula o crescimento da cidade ao clicar
  cidadeArea += 0.05;
  campoArea -= 0.05;
  poluicao += 20;
  bonusAlimentosPorRega = max(0, bonusAlimentosPorRega - 5);

  // Garante que as áreas permaneçam dentro dos limites (0 a 1)
  cidadeArea = constrain(cidadeArea, 0, 1);
  campoArea = constrain(campoArea, 0, 1);
  poluicao = constrain(poluicao, 0, 255);

  // Regenera as posições das árvores e prédios para se ajustarem às novas áreas
  generateTrees();
  generateBuildings();
}

function keyPressed() {
  if (gameOver || gameWon) {
    return;
  }

  if (key === 'w' || key === 'W') { // Se a tecla 'W' for pressionada
    // Simula a rega das plantações
    campoArea += 0.03;
    cidadeArea -= 0.03;
    poluicao = max(0, poluicao - 15);
    bonusAlimentosPorRega = min(50, bonusAlimentosPorRega + 15);

    // Garante que as áreas permaneçam dentro dos limites (0 a 1)
    cidadeArea = constrain(cidadeArea, 0, 1);
    campoArea = constrain(campoArea, 0, 1);
    poluicao = constrain(poluicao, 0, 255);

    // Regenera as posições das árvores e prédios para se ajustarem às novas áreas
    generateTrees();
    generateBuildings();
  } else if (key === 's' || key === 'S') { // Se a tecla 'S' for pressionada para colher
    if (!isHarvesting && campoArea > 0.1) { // Só permite colher se não estiver colhendo e tiver campo
      isHarvesting = true;
      harvestProgress = 0;
      tractorX = 10; // Reinicia a posição do trator para o início da colheita
    }
  }
}

// --- Funções Auxiliares ---

function drawPlantations() {
  let fieldWidth = width * campoArea;
  let plantationSpacing = 30;

  for (let x = 10; x < fieldWidth - 10; x += plantationSpacing) {
    for (let y = 40; y < height - 40; y += plantationSpacing) {
      fill(100, 200, 100);
      noStroke();
      rect(x, y, 15, 10);
    }
  }
}

function generateTrees() {
  trees = [];
  let fieldWidth = width * campoArea;
  let treeCount = 20;

  for (let i = 0; i < treeCount; i++) {
    let x = random(10, fieldWidth - 30);
    let y = random(60, height - 60);
    trees.push({
      x: x,
      y: y
    });
  }
}

function drawTrees() {
  for (let i = 0; i < trees.length; i++) {
    let tree = trees[i];
    if (tree.x < width * campoArea - 10) {
      fill(139, 69, 19);
      rect(tree.x, tree.y, 10, 30);

      fill(34, 139, 34);
      ellipse(tree.x + 5, tree.y, 30, 30);
      ellipse(tree.x - 5, tree.y + 10, 25, 25);
      ellipse(tree.x + 15, tree.y + 10, 25, 25);
    }
  }
}

function generateBuildings() {
  buildings = [];
  let cityStartX = width * campoArea;
  let cityWidth = width * cidadeArea;
  let buildingCount = 0;

  if (cityWidth > 0) {
    buildingCount = floor(cityWidth / 40);
  }

  for (let i = 0; i < buildingCount; i++) {
    let x = cityStartX + i * 40 + 10;
    let buildingHeight = random(100, height - 100);
    let buildingWidth = random(25, 35);
    buildings.push({
      x: x,
      height: buildingHeight,
      width: buildingWidth
    });
  }
}

function drawBuildings() {
  let cityStartX = width * campoArea;
  for (let i = 0; i < buildings.length; i++) {
    let building = buildings[i];
    if (building.x >= cityStartX - 10) {
      fill(150, 150, 150);
      rect(building.x, height - building.height, building.width, building.height);

      fill(255, 255, 0, 200);
      let windowSize = 8;
      let windowSpacing = 12;
      for (let wy = height - building.height + 10; wy < height - 20; wy += windowSpacing) {
        for (let wx = building.x + 5; wx < building.x + building.width - 5; wx += windowSpacing) {
          rect(wx, wy, windowSize, windowSize);
        }
      }
    }
  }
}

// --- Função para Desenhar a Conexão (Estrada Curva com Festejos) ---
function drawConnection() {
  let cityEdgeX = width * campoArea; // Onde a cidade começa
  let roadWidth = 40; // Largura da estrada
  let roadY = height / 2 + 100; // Posição Y central da estrada (ajustada para não colidir com a fábrica)

  // Define os pontos de controle para a curva Bezier
  let x1 = cityEdgeX - 80; // Ponto de partida (ligeiramente dentro da cidade)
  let y1 = roadY - roadWidth / 2;

  let cx1 = cityEdgeX + 20; // Ponto de controle 1 (puxa a curva para cima)
  let cy1 = roadY - roadWidth / 2 - 80;

  let cx2 = cityEdgeX + 100; // Ponto de controle 2 (puxa a curva para baixo)
  let cy2 = roadY + roadWidth / 2 + 80;

  let x2 = cityEdgeX + 180; // Ponto final (mais para dentro do campo)
  let y2 = roadY - roadWidth / 2;

  // Desenha o corpo principal da estrada (linha curva espessa)
  stroke(80); // Cinza escuro para a estrada
  strokeWeight(roadWidth); // Torna a linha espessa para simular a largura da estrada
  noFill();
  bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);
  noStroke(); // Remove o contorno para os próximos elementos

  // Desenha as linhas tracejadas na estrada
  stroke(255, 200, 0); // Amarelo para as linhas
  strokeWeight(3);
  let numDashes = 15;
  let dashLength = 10;

  for (let i = 0; i <= numDashes; i++) {
    let t = i / numDashes;
    let px = bezierPoint(x1, cx1, cx2, x2, t);
    let py = bezierPoint(y1, cy1, cy2, cy2, t);

    let tangentX = bezierTangent(x1, cx1, cx2, x2, t);
    let tangentY = bezierTangent(y1, cy1, cy2, y2, t);
    let angle = atan2(tangentY, tangentX);

    push(); // Salva o estilo de desenho atual
    translate(px, py); // Move para o ponto na curva
    rotate(angle); // Gira para alinhar com a curva
    line(-dashLength / 2, 0, dashLength / 2, 0); // Desenha uma linha curta
    pop(); // Restaura o estilo de desenho
  }
  noStroke(); // Remove o contorno para os próximos desenhos

  // --- Adiciona elementos de festejo na estrada ---
  let confettiCount = 15; // Número de "confetes"
  let confettiSize = 5; // Tamanho do confete
  let confettiColors = [
    color(255, 0, 0), // Vermelho
    color(0, 255, 0), // Verde
    color(0, 0, 255), // Azul
    color(255, 255, 0), // Amarelo
    color(255, 0, 255), // Magenta
    color(0, 255, 255) // Ciano
  ];

  for (let i = 0; i < confettiCount; i++) {
    let t = random(0, 1);
    let x = bezierPoint(x1, cx1, cx2, x2, t);
    let y = bezierPoint(y1, cy1, cy2, y2, t);

    let offsetX = random(-roadWidth / 2 + confettiSize, roadWidth / 2 - confettiSize);
    let offsetY = random(-roadWidth / 2 + confettiSize, roadWidth / 2 - confettiSize);

    fill(random(confettiColors)); // Cor aleatória para o confete
    noStroke();
    ellipse(x + offsetX, y + offsetY, confettiSize, confettiSize); // Desenha um pequeno círculo como confete
  }

  // Desenha algumas bandeirinhas festivas
  let flagCount = 5;
  let flagHeight = 15;
  let flagWidth = 10;

  for (let i = 0; i < flagCount; i++) {
    let t = i / (flagCount - 1); // Parâmetro ao longo da curva
    let x = bezierPoint(x1, cx1, cx2, x2, t);
    let y = bezierPoint(y1, cy1, cy2, cy2, t);

    let tangentX = bezierTangent(x1, cx1, cx2, x2, t);
    let tangentY = bezierTangent(y1, cy1, cy2, y2, t);
    let angle = atan2(tangentY, tangentX);

    push(); // Salva o estado de transformação atual
    translate(x, y - roadWidth / 2 - flagHeight / 2); // Posiciona acima da estrada
    rotate(angle); // Gira com a curva
    fill(random(confettiColors)); // Cor aleatória para a bandeirinha
    noStroke();
    triangle(-flagWidth / 2, 0, flagWidth / 2, 0, 0, flagHeight); // Desenha uma bandeirinha triangular
    pop(); // Restaura o estado de transformação
  }
}

// --- Função para Desenhar a Indústria/Fábrica ---
function drawFactory() {
  let factoryX = width * campoArea - 50; // Posição X da fábrica, um pouco para dentro do campo
  let factoryY = height - 200; // Posição Y da fábrica (base)
  let factoryWidth = 100; // Largura da fábrica
  let factoryHeight = 150; // Altura da fábrica

  // Corpo principal da fábrica
  fill(90, 80, 70); // Cinza escuro/marrom para a fábrica
  rect(factoryX, factoryY, factoryWidth, factoryHeight);

  // Telhado da fábrica
  fill(60, 50, 40); // Mais escuro para o telhado
  triangle(factoryX, factoryY, factoryX + factoryWidth, factoryY, factoryX + factoryWidth / 2, factoryY - 30);

  // Chaminé
  let chimneyWidth = 20;
  let chimneyHeight = 60;
  fill(70, 60, 50); // Cor da chaminé
  rect(factoryX + factoryWidth - chimneyWidth - 10, factoryY - chimneyHeight, chimneyWidth, chimneyHeight);

  // Fumaça da chaminé (simples elipses)
  fill(200, 200, 200, 150 - poluicao * 0.5); // Fumaça mais densa com mais poluição
  noStroke();
  ellipse(factoryX + factoryWidth - chimneyWidth / 2 - 10, factoryY - chimneyHeight - 10, 30, 20);
  ellipse(factoryX + factoryWidth - chimneyWidth / 2 - 15, factoryY - chimneyHeight - 30, 25, 18);
  ellipse(factoryX + factoryWidth - chimneyWidth / 2 - 5, factoryY - chimneyHeight - 50, 20, 15);
}

// --- Função para Desenhar o Trator ---
function drawTractor() {
  let fieldWidth = width * campoArea;

  if (isHarvesting) {
    // Animação de movimento do trator
    tractorX += tractorSpeed;
    if (tractorX > fieldWidth - 40) { // Chegou ao fim do campo
      tractorX = fieldWidth - 40; // Para no final do campo
      harvestProgress++; // Incrementa o progresso da colheita
      if (harvestProgress >= HARVEST_DURATION) {
        isHarvesting = false; // Colheita finalizada
        alimentosProduzidos += HARVEST_FOOD_BONUS; // Adiciona bônus de alimentos
        alimentosProduzidos = constrain(alimentosProduzidos, 0, 200); // Garante o limite
      }
    }

    // Desenha as marcas da colheita
    fill(180, 180, 180, 100); // Cor cinza transparente para as marcas
    rect(10, tractorY + 25, tractorX - 10, 10); // Marca a área colhida
  } else {
    // Se não estiver colhendo, o trator fica parado no início ou no fim
    tractorX = 10; // Volta para o início do campo
  }


  // Corpo do trator
  fill(255, 200, 0); // Amarelo para o trator
  rect(tractorX, tractorY, 40, 25);

  // Cabine
  fill(180, 180, 180);
  rect(tractorX + 10, tractorY - 15, 20, 15);

  // Rodas
  fill(0); // Preto para as rodas
  ellipse(tractorX + 10, tractorY + 25, 15, 15); // Roda dianteira
  ellipse(tractorX + 35, tractorY + 25, 20, 20); // Roda traseira

  // Colheitadeira traseira (quando colhendo)
  if (isHarvesting) {
    fill(139, 69, 19); // Marrom
    rect(tractorX - 20, tractorY, 20, 20); // Parte da colheitadeira
    fill(200, 200, 0); // Amarelo mais claro para as pás
    rect(tractorX - 15, tractorY - 5, 10, 30); // Pás
  }
}

// --- Funções para Condições de Jogo ---

function checkGameConditions() {
  // Condição de Derrota: Poluição Excessiva
  if (poluicao >= MAX_POLUTION) {
    gameOver = true;
  }
  // Condição de Derrota: Falta de Alimentos
  else if (alimentosProduzidos <= MIN_FOOD && frameCount > 1000) { // Dá um tempo para o jogo começar
    gameOver = true;
  }
  // Condição de Vitória: Pontuação Alta
  else if (score >= WIN_SCORE) {
    gameWon = true;
  }
}

function displayEndScreen() {
  background(0); // Fundo preto
  fill(255); // Texto branco
  textSize(48);
  textAlign(CENTER, CENTER);

  if (gameWon) {
    text("VITÓRIA!", width / 2, height / 2 - 30);
    textSize(24);
    text("Você alcançou uma Pontuação Alta!", width / 2, height / 2 + 10);
  } else if (gameOver) {
    text("DERROTA!", width / 2, height / 2 - 30);
    textSize(24);
    if (poluicao >= MAX_POLUTION) {
      text("A poluição se tornou insustentável!", width / 2, height / 2 + 10);
    } else if (alimentosProduzidos <= MIN_FOOD) {
      text("Você ficou sem alimentos!", width / 2, height / 2 + 10);
    }
  }

  // Botão de jogar novamente
  fill(50, 150, 250); // Azul
  rect(width / 2 - 60, height / 2 + 50, 120, 30, 5); // Botão arredondado
  fill(255);
  textSize(20);
  text("REINICIAR", width / 2, height / 2 + 65);
}