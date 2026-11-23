import Link from "next/link";

import { PageHeading } from "@/components/layout/page-heading";

type Locale = "fr" | "en" | "ar";

type Block = { title: string; text: string; href?: string };

type Copy = { eyebrow: string; title: string; lede: string; blocks: Block[] };

const PAGES: Record<string, Record<Locale, Copy>> = {
  "a-propos": {
    fr: {
      eyebrow: "Accueil",
      title: "La Nouvelle Génération",
      lede: "Ce mouvement de jeunesse béni a pour vocation de sensibiliser les jeunes, de purifier les âmes et d’y inculquer les vertus et les bonnes valeurs.",
      blocks: [
        { title: "Le fondateur", text: "Fondé par Seydina Aliou Cissé, fils de l’Imam Cheikh Tidiane Cissé, qu’Allah soit satisfait de lui." },
        { title: "La voie", text: "« Celui qui veut être avec moi, qu’il suive ma voie dans ses paroles et dans ses actes. »" },
        { title: "Le verset du mouvement", text: "« J’aspire à l’agrément du Seigneur afin de soutenir Sa religion, et de présenter un modèle exemplaire à la nouvelle génération. »" },
      ],
    },
    en: {
      eyebrow: "About",
      title: "The New Generation",
      lede: "This blessed youth movement exists to awaken the young, to purify souls, and to plant in them virtue and sound values.",
      blocks: [
        { title: "The founder", text: "Founded by Seydina Aliou Cissé, son of Imam Cheikh Tidiane Cissé, may Allah be pleased with him." },
        { title: "The path", text: "“Whoever wants to be with me, let him follow my path in his words and in his deeds.”" },
        { title: "The movement’s verse", text: "“I seek the pleasure of the Lord, so as to uphold His religion and to offer an exemplary model to the new generation.”" },
      ],
    },
    ar: {
      eyebrow: "عن الحركة",
      title: "الجيل الجديد",
      lede: "هذه الحركة الشبابية المباركة غايتها توعية الشباب، وتزكية النفوس، وغرس الفضائل والقيم فيها.",
      blocks: [
        { title: "المؤسس", text: "أسسها سيدنا علي سيسي، نجل الإمام الشيخ تجاني سيسي، رضي الله عنه." },
        { title: "السبيل", text: "« من أراد أن يكون معي فليتبع سبيلي في أقواله وأفعاله. »" },
        { title: "بيت الحركة", text: "« أرجو رضى الرب لأعين دينه، وأقدّم للجيل الجديد قدوة حسنة. »" },
      ],
    },
  },
  objectifs: {
    fr: {
      eyebrow: "Le programme",
      title: "Objectifs généraux",
      lede: "Les objectifs généraux du mouvement se résument comme suit.",
      blocks: [
        { title: "Connaissance mutuelle et fraternité", text: "Promouvoir la connaissance mutuelle et le rapprochement entre les peuples, tout en renforçant le sentiment d’appartenance à la grande fraternité islamique." },
        { title: "Patrimoine et voie du Cheikh", text: "Préserver le patrimoine islamique à travers la sagesse et la bonne exhortation, en s’attachant à la voie du Cheikh, qu’Allah soit satisfait de lui, et en étudiant ses enseignements." },
        { title: "L’époque et les principes immuables", text: "S’adapter aux évolutions et aux exigences de l’époque, tout en demeurant fermement attaché aux principes fondamentaux et aux valeurs immuables." },
        { title: "Unité de la Fayda", text: "Rejeter les divisions et les conflits entre les membres de la Fayda, et œuvrer à l’unité, au rapprochement et à l’unification des rangs." },
      ],
    },
    en: {
      eyebrow: "The programme",
      title: "General aims",
      lede: "The general aims of the movement are these.",
      blocks: [
        { title: "Mutual knowledge and brotherhood", text: "To foster mutual knowledge and closeness among peoples, and to strengthen belonging to the great Islamic brotherhood." },
        { title: "Heritage and the Shaykh’s path", text: "To preserve the Islamic heritage through wisdom and good counsel, holding to the path of the Shaykh, may Allah be pleased with him, and studying his teachings." },
        { title: "The age and the unchanging principles", text: "To meet the demands of the age while remaining firmly attached to the fundamental principles and the values that do not change." },
        { title: "Unity of the Fayda", text: "To refuse divisions and conflict among the people of the Fayda, and to work for unity and the joining of the ranks." },
      ],
    },
    ar: {
      eyebrow: "البرنامج",
      title: "الأهداف العامة",
      lede: "تتلخص الأهداف العامة للحركة فيما يلي.",
      blocks: [
        { title: "التعارف والأخوة", text: "تعزيز التعارف والتقارب بين الشعوب، وترسيخ الانتماء إلى الأخوة الإسلامية الكبرى." },
        { title: "التراث وسبيل الشيخ", text: "حفظ التراث الإسلامي بالحكمة والموعظة الحسنة، مع التمسك بسبيل الشيخ، رضي الله عنه، ودراسة تعاليمه." },
        { title: "العصر والمبادئ الثابتة", text: "مواكبة تطورات العصر ومتطلباته، مع الثبات على المبادئ الأساسية والقيم التي لا تتبدل." },
        { title: "وحدة الفيضة", text: "رفض الفرقة والنزاع بين أهل الفيضة، والعمل على الوحدة والتقارب وجمع الصف." },
      ],
    },
  },
  evenements: {
    fr: {
      eyebrow: "Le calendrier",
      title: "Événements",
      lede: "La rencontre annoncée du mouvement.",
      blocks: [
        { title: "Imam Day", text: "La Journée internationale de l’Imam Cheikh Tidiane Cissé, le 24 janvier 2027, à l’Hôtel King Fahd Palace, Dakar.", href: "/evenements/imam-day" },
      ],
    },
    en: {
      eyebrow: "The calendar",
      title: "Events",
      lede: "The gathering announced by the movement.",
      blocks: [
        { title: "Imam Day", text: "The International Day of Imam Cheikh Tidiane Cissé, 24 January 2027, at the King Fahd Palace Hotel, Dakar.", href: "/evenements/imam-day" },
      ],
    },
    ar: {
      eyebrow: "الرزنامة",
      title: "الفعاليات",
      lede: "اللقاء الذي أعلنته الحركة.",
      blocks: [
        { title: "يوم الإمام", text: "اليوم الدولي للإمام الشيخ تجاني سيسي، 24 يناير 2027، بفندق قصر الملك فهد، دكار.", href: "/evenements/imam-day" },
      ],
    },
  },
  "imam-day": {
    fr: {
      eyebrow: "24 janvier 2027",
      title: "Imam Day",
      lede: "La Journée internationale de l’Imam Cheikh Tidiane Cissé.",
      blocks: [
        { title: "Le lieu", text: "Hôtel King Fahd Palace, Dakar." },
        { title: "Le contact", text: "+221 77 452 43 43 · +221 77 525 55 25 · Jilouljadid1@gmail.com" },
      ],
    },
    en: {
      eyebrow: "24 January 2027",
      title: "Imam Day",
      lede: "The International Day of Imam Cheikh Tidiane Cissé.",
      blocks: [
        { title: "The place", text: "King Fahd Palace Hotel, Dakar." },
        { title: "Contact", text: "+221 77 452 43 43 · +221 77 525 55 25 · Jilouljadid1@gmail.com" },
      ],
    },
    ar: {
      eyebrow: "24 يناير 2027",
      title: "يوم الإمام",
      lede: "اليوم الدولي للإمام الشيخ تجاني سيسي.",
      blocks: [
        { title: "المكان", text: "فندق قصر الملك فهد، دكار." },
        { title: "التواصل", text: "+221 77 452 43 43 · +221 77 525 55 25 · Jilouljadid1@gmail.com" },
      ],
    },
  },
  rejoindre: {
    fr: {
      eyebrow: "La demande",
      title: "Nous rejoindre",
      lede: "La demande d’adhésion est examinée par le secrétariat. Elle n’ouvre pas le réseau toute seule.",
      blocks: [
        { title: "Écrire", text: "Jilouljadid1@gmail.com" },
        { title: "Appeler", text: "+221 77 452 43 43 · +221 77 525 55 25" },
      ],
    },
    en: {
      eyebrow: "The request",
      title: "Join us",
      lede: "A request to join is read by the secretariat. It does not open the network by itself.",
      blocks: [
        { title: "Write", text: "Jilouljadid1@gmail.com" },
        { title: "Call", text: "+221 77 452 43 43 · +221 77 525 55 25" },
      ],
    },
    ar: {
      eyebrow: "الطلب",
      title: "انضم إلينا",
      lede: "ينظر الأمانة في طلب الانضمام. والطلب وحده لا يفتح الشبكة.",
      blocks: [
        { title: "الكتابة", text: "Jilouljadid1@gmail.com" },
        { title: "الهاتف", text: "+221 77 452 43 43 · +221 77 525 55 25" },
      ],
    },
  },
};

export function JiloulPage({ locale, page }: { locale: string; page: keyof typeof PAGES }) {
  const lang: Locale = locale === "en" || locale === "ar" ? locale : "fr";
  const copy = PAGES[page][lang];
  return (
    <>
      <PageHeading eyebrow={copy.eyebrow} title={copy.title} lede={copy.lede} />
      <section className="nh-container nh-section grid gap-4 md:grid-cols-2">
        {copy.blocks.map((block) => {
          const className = `rounded-lg border border-line bg-surface p-6${block.href ? " block transition hover:border-gold-300" : ""}`;
          const inner = (
            <>
              <h2 className="font-sans text-xl font-bold">{block.title}</h2>
              <p className="mt-3 text-content-secondary" dir="auto">{block.text}</p>
            </>
          );
          if (block.href) {
            return (
              <Link key={block.title} href={`/${lang}${block.href}`} className={className}>
                {inner}
              </Link>
            );
          }
          return (
            <article key={block.title} className={className}>
              {inner}
            </article>
          );
        })}
      </section>
    </>
  );
}
