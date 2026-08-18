import axiosInstance from "@/utils/apiHelper";
import axios from "axios";
export const getRoles =async()=>{
    const respose = await axiosInstance.get("/roles/")
    // console.log(respose.data)
    return respose.data;
}

export const getUsers = async () => {
    const respose = await axiosInstance.get("/users/")
    console.log(respose.data)
    return respose.data;
}
export const createuser=async (payload)=>{
    const reponse =await axios.post("/users/",payload)
    return reponse.data;
}