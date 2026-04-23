import { Link } from "react-router-dom";
import style from "./DashboardCard.module.css";

export default function DashboardCard({title, icon,  destination}) {

    return(
    <Link to ={destination} className={style.cardLink}>
     <div className = {style.card}>
        <img src = {icon} alt={title} className={style.cardIcon}/>
        <p className={style.cardText}>{title}</p>
     </div>
    </Link>
    );

}