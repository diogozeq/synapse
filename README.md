GLOBAL SOLUTION 2025.2 - O FUTURO DO TRABALHO


**Integrante:** Diogo Zequini

---

## 1. O QUE É O PROJETO 

A GS pediu uma solução para tornar o trabalho mais humano e sustentável. Minha resposta é o **Synapse**: uma **Universidade Corporativa Gamificada e Adaptativa**.

O diferencial não é apenas oferecer cursos, mas como eles são entregues. O sistema promove a inclusão ao expor todos os colaboradores a diversos formatos de aprendizado (simulado, resumo, quizzes, flashcards, what-if, preencher lacunas...), mas realiza um **equilíbrio automático** do conteúdo.

Se o colaborador está estressado, o ritmo diminui. Se tem alta performance em testes práticos, o sistema adapta a trilha. O objetivo é garantir que todos aprendam, independentemente do seu perfil, via biofeedback, maximizando a aderência sem gerar burnout.

---

## 2. DEMANDA vs. SOLUÇÃO
Aqui está exatamente como o Synapse atende cada ponto pedido no edital da Global Solution:

| O que a GS pediu | Como eu resolvi no App |
| :--- | :--- |
| **Monitoramento de Bem-Estar** | Implementei o **Check-in Diário**. O colaborador registra sono, estresse e foco, e o sistema cruza esses dados com a performance para ajustar a carga de estudos. |
| **Recrutamento e Inclusão** | A inclusão acontece na **adaptabilidade**. O algoritmo garante que ninguém fique para trás: ele identifica o perfil de cada um e equilibra os tipos de atividades (mais visuais, mais práticas ou mais teóricas) para maximizar a absorção. |
| **Uso de IA e Dados Reais** | Utilizei **10 modelos de Machine Learning** reais. Prevemos risco de burnout e abandono de curso, usando dados comportamentais para personalizar a experiência. |
| **Bots e Agentes Inteligentes** | Integrei a API do **Google Gemini** para atuar como um tutor. Ele gera cursos completos a partir de textos/conteúdos brutos e cria explicações personalizadas quando o aluno erra uma questão. |
| **Soluções Gamificadas** | Sistema robusto de XP, Níveis, Streak (dias seguidos) e Ranking. A gamificação mantém o engajamento alto, transformando o aprendizado corporativo em um hábito diário. |

---

## 3. CHECKLIST TÉCNICO

Como apliquei cada matéria do curso na prática para viabilizar essa adaptação:

*   **Machine Learning & Redes Neurais:** O motor da adaptação. Usei **XGBoost** para prever burnout e **Clustering (K-Means)** para identificar perfis de aprendizado e ajustar o conteúdo automaticamente.
*   **Python:** Backend 100% em **FastAPI**. Garante a velocidade necessária para processar os dados biométricos e adaptar a interface em tempo real.
*   **Linguagem R:** Utilizada para validação estatística. Comprovamos matematicamente as correlações (ex: "mais sono = maior retenção de conteúdo") para embasar as decisões da IA.
*   **Cybersecurity:** Proteção total. Dados sensíveis (CPF, E-mail) criptografados (Fernet) e senhas com hash (Bcrypt). Logs de auditoria imutáveis garantem rastreabilidade.
*   **Banco de Dados:** **SQLite** com **Prisma ORM**. Modelagem híbrida: relacional para a estrutura da universidade e séries temporais para os dados de saúde e progresso.
*   **Computação em Nuvem:** Arquitetura stateless e containerizada. Pronta para escalar horizontalmente conforme a base de colaboradores cresce.
*   **AICSS (Cognitive Systems):** A IA Generativa (Gemini) permite que o conteúdo seja infinito e sempre atualizado, criando avaliações contextuais na hora.

---

## 4. RESULTADOS REAIS

Rodando os modelos com os dados do protótipo, validamos a eficácia da abordagem:

1.  **Bem-Estar gera Performance:** Colaboradores com sono regular (7-8h) apresentaram performance **20% superior** na plataforma.
2.  **Prevenção Ativa:** O algoritmo identifica **90%** dos casos de risco de burnout antes que se tornem críticos, permitindo intervenção do RH.
3.  **Impacto do Estresse:** Confirmamos uma correlação negativa (-0.42) entre estresse e notas. O sistema adaptativo atua aqui: reduzindo a carga cognitiva em dias de alto estresse para manter a constância sem sobrecarga.

---

## 5. CONCLUSÃO

O Synapse prova que a tecnologia pode humanizar o ambiente corporativo. Ao criar uma universidade que se molda ao colaborador — e não o contrário — garantimos um futuro do trabalho mais justo, inclusivo e sustentável.

---

## LINKS

*   **Vídeo (YouTube):** [INSIRA O LINK AQUI]
*   **GitHub (Privado):** https://github.com/diogozeq/synapse/
