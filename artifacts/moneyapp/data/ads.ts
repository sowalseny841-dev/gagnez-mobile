import { AdData } from "@/components/AdCard";

export const AD_CATALOG: AdData[] = [
  {
    id: "1",
    title: "Découvrez Orange Money - Transfert rapide partout en Guinée",
    brand: "Orange Guinée",
    reward: 500,
    duration: 15,
    type: "video",
    icon: "📱",
    color: "#FF6600",
  },
  {
    id: "2",
    title: "MTN MoMo: Payez vos factures sans bouger de chez vous",
    brand: "MTN Guinée",
    reward: 750,
    duration: 20,
    type: "video",
    icon: "💳",
    color: "#FFCB00",
  },
  {
    id: "3",
    title: "Quelle est votre marque de téléphone préférée ?",
    brand: "TechSurvey",
    reward: 300,
    duration: 10,
    type: "survey",
    icon: "📊",
    color: "#6366f1",
  },
  {
    id: "4",
    title: "Wave: Envoyez de l'argent en secondes, sans frais cachés",
    brand: "Wave Africa",
    reward: 1000,
    duration: 25,
    type: "video",
    icon: "🌊",
    color: "#1A96F0",
  },
  {
    id: "5",
    title: "Participez à notre quiz et gagnez plus de points bonus !",
    brand: "GagnezMobile",
    reward: 600,
    duration: 30,
    type: "quiz",
    icon: "🎯",
    color: "#16c784",
  },
  {
    id: "6",
    title: "Conakry Market - Achetez et vendez en ligne facilement",
    brand: "Conakry Market",
    reward: 400,
    duration: 15,
    type: "video",
    icon: "🛒",
    color: "#ec4899",
  },
  {
    id: "7",
    title: "Groupes d'épargne numériques - Tontine digitale sécurisée",
    brand: "TontinePro",
    reward: 800,
    duration: 20,
    type: "video",
    icon: "🤝",
    color: "#f59e0b",
  },
  {
    id: "8",
    title: "Quel opérateur mobile utilisez-vous principalement ?",
    brand: "DataSurvey GN",
    reward: 350,
    duration: 10,
    type: "survey",
    icon: "📋",
    color: "#8b5cf6",
  },
  {
    id: "9",
    title: "Assurance moto & auto - Couvrez-vous dès aujourd'hui",
    brand: "Assur Guinée",
    reward: 650,
    duration: 18,
    type: "video",
    icon: "🏍️",
    color: "#ef4444",
  },
  {
    id: "10",
    title: "Formation en ligne gratuite: Excel, Word, et plus encore",
    brand: "EduTech Afrique",
    reward: 550,
    duration: 20,
    type: "video",
    icon: "🎓",
    color: "#0ea5e9",
  },
];

export function getDailyAds(): AdData[] {
  const today = new Date().getDate();
  const shuffled = [...AD_CATALOG].sort((a, b) => {
    const hashA = (parseInt(a.id) * today * 31) % 100;
    const hashB = (parseInt(b.id) * today * 31) % 100;
    return hashA - hashB;
  });
  return shuffled.slice(0, 6);
}
