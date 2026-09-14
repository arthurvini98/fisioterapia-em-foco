export function loadingIssue(stage,error){
  const messages={
    graphics:'Não foi possível iniciar os gráficos 3D. Confira a aceleração gráfica do navegador ou tente outro navegador.',
    download:'Não foi possível baixar ou ler os arquivos do modelo. Confira a conexão e tente novamente. Se persistir, copie o diagnóstico abaixo.',
    geometry:'Os arquivos chegaram, mas não foi possível montar o modelo. Copie o diagnóstico para investigarmos.',
    scene:'Ocorreu um erro ao preparar a vista 3D. Copie o diagnóstico para investigarmos.'
  };
  return {
    title:'O modelo 3D não carregou.',
    message:messages[stage]||messages.scene,
    diagnostic:`Anatomia em Foco — carregamento 3D\nEtapa: ${stage}\n${error?.name||'Error'}: ${error?.message||'Erro sem detalhes'}`
  };
}
