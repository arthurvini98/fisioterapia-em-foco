export function lessonNavigation(saved,total){
 const completed=new Set(saved.completedSteps);
 const firstPending=Array.from({length:total},(_,i)=>i).find(i=>!completed.has(i))??null;
 return {firstPending,steps:Array.from({length:total},(_,index)=>({index,completed:completed.has(index),available:completed.has(index)||index===saved.currentStep||index===firstPending}))};
}
export function lessonPracticeIds(lesson,records){
 return [...new Set(lesson.steps.flatMap(step=>[step.focus,step.target]).filter(id=>id&&records.get(id)?.quizEligible))];
}

export function learnedStructureIds(lessons,savedByLesson,records){
 const ids=new Set();
 for(const lesson of Object.values(lessons)){
  const completed=savedByLesson(lesson.id).completedSteps;
  for(const index of completed){const step=lesson.steps[index];if(!step)continue;for(const id of [step.focus,step.target])if(id&&records.get(id)?.quizEligible)ids.add(id);}
 }
 return [...ids];
}
