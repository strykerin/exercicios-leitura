import { extraPassages } from './library.js';
import { longPassages } from './long-passages.js';

export function chunks(text, size) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return Array.from({ length: Math.ceil(words.length / size) }, (_, i) => words.slice(i * size, (i + 1) * size).join(' '));
}
export const wordCount = text => text.trim().split(/\s+/).filter(Boolean).length;
export const duration = (chunk, wpm) => wordCount(chunk) * 60000 / wpm;
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function streak(sessions, now = new Date()) {
  const days = new Set(sessions.map(s => s.day));
  const cursor = new Date(now);
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDay(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}
const originalPassages = [
  {
    title: 'A arte de prestar atenção', category: 'Mente e foco',
    text: 'Em uma manhã tranquila, uma naturalista se senta à beira de um lago. No início, a paisagem parece imóvel. Então surge uma ondulação, um pássaro se move entre os galhos e um pequeno inseto pousa na água. Nada na cena mudou de forma radical. O que mudou foi a qualidade da atenção de quem observa. A atenção funciona um pouco como um refletor. Ela ilumina uma pequena parte do mundo enquanto deixa outros detalhes em segundo plano. Quando mudamos esse foco com muita frequência, gastamos energia para encontrar nosso lugar novamente. Permanecer em uma atividade dá à mente tempo para perceber padrões. Por isso, um período curto de prática concentrada pode ser diferente de um período mais longo cheio de interrupções. A naturalista não tenta enxergar tudo de uma vez. Ela escolhe uma pequena área e deixa os detalhes aparecerem. A leitura exige um equilíbrio parecido. Queremos avançar, mas também precisamos dar espaço à compreensão. Uma prática útil é terminar um texto e lembrar sua ideia principal sem voltar às linhas anteriores. Se a ideia estiver clara, o ritmo pode estar confortável. Se ela desaparecer, diminuir a velocidade pode ajudar. O progresso não é apenas a quantidade de palavras que passam diante dos nossos olhos. É a compreensão que permanece quando a página já ficou para trás.',
    question: 'Segundo o texto, qual é uma forma útil de avaliar seu ritmo de leitura?',
    options: ['Lembrar a ideia principal depois da leitura', 'Contar quantas vezes os olhos se movem', 'Ler sempre mais rápido do que no dia anterior'], answer: 0,
    explanation: 'O texto recomenda lembrar a ideia principal para verificar se o ritmo favorece a compreensão.'
  },
  {
    title: 'Uma floresta na cidade', category: 'Natureza',
    text: 'Uma árvore na cidade faz mais do que enfeitar a rua. Suas folhas interceptam a luz do sol e fazem sombra sobre a calçada. Nas tardes quentes, essa sombra pode tornar a caminhada mais agradável. A água também passa do solo pela árvore e chega ao ar através das folhas. Esse processo ajuda a refrescar o ambiente ao redor. Abaixo da superfície, as raízes ocupam espaços que muitas vezes são menores do que parecem. Uma árvore pode estar ao lado de uma avenida larga e, ainda assim, ter apenas uma faixa estreita de solo disponível. A terra compactada dificulta a chegada de água e ar às raízes. Por isso, plantar bem na cidade exige mais do que escolher uma espécie bonita. É preciso considerar o solo, o espaço, a água e as condições que a árvore enfrentará ao crescer. Uma árvore jovem precisa de cuidados muito antes de oferecer uma copa ampla. Algumas comunidades organizam grupos para regar as plantas durante períodos secos, dividindo a responsabilidade pelas árvores do quarteirão. Essas pequenas rotinas podem ajudar um novo plantio a sobreviver aos primeiros anos. Com o tempo, áreas isoladas de sombra podem formar um caminho contínuo pelo bairro. As pessoas podem escolher esse trajeto para chegar a uma loja ou a um ponto de ônibus. O valor de uma floresta urbana vem tanto de cada árvore quanto da rede que elas formam. Planejar essa rede exige pensar em décadas, e não apenas em uma temporada de plantio.',
    question: 'Por que o plantio urbano precisa de um planejamento que vá além da época de plantar?',
    options: ['As árvores só precisam de cuidados depois de adultas', 'As árvores precisam de condições adequadas e cuidados ao longo do tempo', 'Qualquer solo à beira da rua oferece espaço suficiente'], answer: 1,
    explanation: 'As árvores precisam de solo, espaço, água e cuidados contínuos para formar uma rede de copas e sombras.'
  },
  {
    title: 'Pequenos passos, mudanças duradouras', category: 'Ciência no cotidiano',
    text: 'Quando as pessoas decidem aprender algo novo, costumam imaginar um começo grandioso. Compram equipamentos, reservam uma tarde inteira e planejam uma rotina ambiciosa. Mas a parte mais importante pode ser bem menor: voltar no dia seguinte. Uma prática simples reduz o esforço necessário para começar. Dez minutos de trabalho atento cabem em um dia comum, enquanto um plano complicado pode depender de condições perfeitas. Ter constância não significa repetir exatamente a mesma tarefa para sempre. Uma musicista pode praticar devagar um trecho conhecido, perceber uma transição difícil e dedicar a sessão seguinte a essa passagem. A rotina permanece estável enquanto o desafio muda. Observar os resultados torna esse processo útil. Sem essa observação, a repetição pode reforçar um erro com a mesma facilidade com que desenvolve uma habilidade. Uma boa avaliação indica um ajuste específico em vez de fazer um julgamento amplo. Em vez de concluir que uma sessão foi ruim, quem aprende pode perceber que uma etapa precisa de mais atenção. O descanso também faz parte do processo. Uma pausa permite voltar com a atenção renovada e evita transformar a prática em uma prova de resistência. Ao longo de uma semana, as sessões podem parecer comuns. Depois de vários meses, seus efeitos podem ficar mais visíveis. O objetivo não é tornar cada dia extraordinário. É tornar o próximo passo útil simples o bastante para ser dado e claro o bastante para ensinar alguma coisa.',
    question: 'Qual atitude combina melhor com o conselho do texto?',
    options: ['Esperar até ter uma tarde inteira disponível', 'Repetir sem ajustar a maneira de praticar', 'Praticar com regularidade e observar o que precisa de ajuste'], answer: 2,
    explanation: 'O texto destaca a prática constante e viável, acompanhada de observações que orientem ajustes específicos.'
  }
];

const additionalQuestions = [
  [
    { prompt: 'A que o texto compara a atenção?', options: ['A um relógio', 'A um refletor', 'A uma ponte'], answer: 1, explanation: 'O refletor ilumina uma parte do mundo e deixa outros detalhes em segundo plano, assim como a atenção.' },
    { prompt: 'O que acontece quando mudamos o foco com muita frequência?', options: ['Percebemos todos os detalhes de uma vez', 'Eliminamos a necessidade de pausas', 'Gastamos energia para encontrar nosso lugar novamente'], answer: 2, explanation: 'O texto destaca o esforço necessário para retomar a atividade depois de mudar o foco.' }
  ],
  [
    { prompt: 'O que a terra compactada dificulta?', options: ['A chegada de água e ar às raízes', 'A formação de sombra pelos prédios', 'A passagem de pessoas pela avenida'], answer: 0, explanation: 'A compactação do solo dificulta que água e ar cheguem às raízes.' },
    { prompt: 'Qual ação comunitária é citada para cuidar das árvores jovens?', options: ['Retirar todas as folhas', 'Organizar grupos de rega nos períodos secos', 'Plantar apenas árvores adultas'], answer: 1, explanation: 'O texto menciona comunidades que dividem a responsabilidade pela rega durante períodos secos.' }
  ],
  [
    { prompt: 'Por que observar os resultados é importante?', options: ['Para evitar qualquer mudança na rotina', 'Para garantir resultados imediatos', 'Para impedir que a repetição apenas reforce erros'], answer: 2, explanation: 'Sem observar os resultados, repetir pode reforçar erros em vez de desenvolver uma habilidade.' },
    { prompt: 'Qual é o papel do descanso no texto?', options: ['Permitir o retorno com a atenção renovada', 'Substituir toda a prática', 'Eliminar os desafios seguintes'], answer: 0, explanation: 'Uma pausa ajuda a renovar a atenção e evita transformar a prática em uma prova de resistência.' }
  ]
];

export const passages = [
  ...originalPassages.map(({ question, options, answer, explanation, ...passage }, index) => ({
    ...passage, questions: [{ prompt: question, options, answer, explanation }, ...additionalQuestions[index]]
  })),
  ...extraPassages,
  ...longPassages
];

export function textLengthGroup(count) {
  return count < 250 ? 'short' : count < 500 ? 'medium' : 'long';
}

export function validSpeed(value, fallback = 250) {
  const speed = Number(value);
  return Number.isInteger(speed) && speed >= 100 && speed <= 800 && speed % 25 === 0 ? speed : fallback;
}

export function scoreQuiz(questions, answers) {
  return questions.reduce((score, question, index) => score + Number(answers[index] === question.answer), 0);
}

export function dailyPassageIndex(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return day % passages.length;
}
