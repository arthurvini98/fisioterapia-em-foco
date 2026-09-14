const cellSource='https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells';
const fertilizationSource='https://openstax.org/books/anatomy-and-physiology-2e/pages/28-1-fertilization';
const meiosisSource='https://openstax.org/books/biology-ap-courses/pages/11-1-the-process-of-meiosis';
const cells={
 'Membrana plasmática':['Limite seletivo da célula.','Regula as trocas com o meio.','Compare o contorno externo com o núcleo interno.'],
 'Núcleo':['Compartimento que contém a maior parte do DNA.','Abriga informações usadas na atividade celular.','O corte permite enxergar os fios de cromatina.'],
 'Cromatina':['DNA associado a proteínas.','Organiza o material genético.','Os fios são esquemáticos; o DNA não permanece sempre em X.'],
 'Mitocôndrias':['Organelas celulares.','Participam da produção de ATP pela respiração celular.','Selecione uma das formas alaranjadas ao redor do núcleo.']
};
const fertilization={
 'Zona pelúcida':['Revestimento de glicoproteínas.','Participa da interação com o espermatozoide e do bloqueio à poliespermia.','Observe a camada entre corona e membrana.'],
 'Corona radiata':['Células foliculares ao redor do ovócito.','Acompanham o ovócito na ovulação.','As esferas externas representam células distintas.'],
 'Membrana do ovócito':['Limite celular do ovócito.','É o local da fusão com a membrana do espermatozoide.','Está por dentro da zona pelúcida.'],
 'Acrossomo':['Compartimento na cabeça do espermatozoide.','Libera conteúdo na reação acrossômica.','Observe a pequena região na ponta da cabeça.'],
 'Grânulos corticais':['Vesículas próximas da membrana.','Sua liberação ajuda a bloquear a poliespermia.','Observe os pequenos pontos periféricos.'],
 'Segundo corpúsculo polar':['Pequena célula da divisão meiótica.','Recebe material genético ao concluir a meiose II.','Compare seu tamanho com o ovócito.'],
 'Pronúcleo materno':['Núcleo de origem materna.','Organiza o material genético materno.','Compare as duas regiões internas.'],
 'Pronúcleo paterno':['Núcleo de origem paterna.','Organiza o material genético paterno.','Os pronúcleos não se colam: suas membranas se desfazem.']
};
export function structureGuide(name,stage){
 let data=cells[name],source=cellSource;
 if(!data){data=fertilization[name];source=fertilizationSource;}
 if(!data&&name.startsWith('Homólogo')){data=['Um dos cromossomos de um par homólogo.','Na meiose I, separa-se de seu homólogo mantendo as cromátides-irmãs unidas.','Observe o X inteiro indo para um polo.'];source=meiosisSource;}
 if(!data&&name.startsWith('Cromátide-irmã')){data=['Uma das cópias de um cromossomo duplicado.','Na meiose II, separa-se da irmã e passa a ser um cromossomo independente.','Compare as duas linhas que formavam o X.'];source=meiosisSource;}
 return data?{what:data[0],role:data[1],observe:data[2],source}:null;
}
