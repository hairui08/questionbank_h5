import { createApp } from "vue";
import RootLayout from "./RootLayout.vue";
import router from "./router";
import "./style.css";

createApp(RootLayout).use(router).mount("#app");
