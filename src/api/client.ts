import { create } from "apisauce";

const apiClient = create({
    baseURL: "http://localhost:3000"
})

export default apiClient;