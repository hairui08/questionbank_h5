import { createRouter, createWebHistory } from "vue-router";
import ExamAnswer from "../pages/ExamAnswer.vue";
import ExamChapter from "@/pages/ExamChapter.vue";
import ExamAnalysis from "../pages/ExamAnalysis.vue";
import WrongList from "../pages/WrongList.vue";
import CollectList from "../pages/CollectList.vue";
import ExamResult from "../pages/ExamResult.vue";

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
      path: "/chapter",
      name: "chapter",
      component: ExamChapter,
    },
    {
      path: "/analysis",
      name: "analysis",
      component: ExamAnalysis,
    },
    {
      path: "/wronglist",
      name: "wronglist",
      component: WrongList,
    },
    {
      path: "/collectlist",
      name: "collectlist",
      component: CollectList,
    },
    {
      path: "/examresult",
      name: "examresult",
      component: ExamResult,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
