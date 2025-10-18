import { createRouter, createWebHistory } from "vue-router";
import ExamAnswer from "../pages/ExamAnswer.vue";
import ExamAnalysis from "../pages/ExamAnalysis.vue";

const HomePlaceholder = {
  name: "HomePlaceholder",
  render: () => null,
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePlaceholder,
      meta: { isHome: true },
    },
    {
      path: "/answer",
      name: "answer",
      component: ExamAnswer,
    },
    {
      path: "/analysis",
      name: "analysis",
      component: ExamAnalysis,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
