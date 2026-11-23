import Image from "next/image";

import { BannerSlider, type BannerSlide } from "@/components/layout/banner-slider";
import { CommuniqueBar } from "@/components/layout/communique-bar";
import { PartnersMarquee, type PartnerLogo } from "@/components/layout/partners-marquee";
import { TestimonialsCarousel, type TestimonialCard } from "@/components/layout/testimonials-carousel";
import { AboutShortcuts } from "@/components/movement/about-shortcuts";

type Locale = "fr" | "en" | "ar";

type Copy = {
  communique: string;
  communiqueLabel: string;
  slides: { eyebrow: string; title: string; href: string; image?: string; focus?: string; fit?: "cover" | "contain" }[];
  introTitle: string;
  introLede: string;
  introPoints: string[];
  introMore: string;
  founderEyebrow: string;
  founderTitle: string;
  founderParagraphs: string[];
  founderName: string;
  founderLine: string;
  aimsTitle: string;
  aimsLede: string;
  aims: { title: string; text: string }[];
};

const COPY: Record<Locale, Copy> = {
  fr: {
    communique: "La Journée internationale de l’Imam Cheikh Tidiane Cissé, le 24 janvier 2027, à l’Hôtel King Fahd Palace, Dakar.",
    communiqueLabel: "Communiqué",
    slides: [
      { eyebrow: "24 janvier 2027", title: "Imam Day", href: "/evenements/imam-day", image: "/events/imam-day.jpg", fit: "contain" },
      { eyebrow: "Accueil", title: "La Nouvelle Génération", href: "#mouvement", image: "/brand/intro-lecon.jpg", focus: "center 78%" },
      { eyebrow: "Le programme", title: "Objectifs généraux", href: "#objectifs", image: "/brand/intro-lecon.jpg", focus: "center 75%" },
      { eyebrow: "Événement", title: "Journée Ansaroudine", href: "/evenements/ansaroudine", image: "/events/ansaroudine-1.jpg", focus: "center 22%" },
      { eyebrow: "Maroc", title: "Journée Ansaroudine", href: "/evenements/ansaroudine", image: "/events/ansaroudine-2.jpg", focus: "center 24%" },
      { eyebrow: "Maroc", title: "Journée Ansaroudine", href: "/evenements/ansaroudine", image: "/events/ansaroudine-3.jpg", focus: "center 20%" },
      { eyebrow: "Événement", title: "Prière et hadara", href: "/evenements/guediawaye", image: "/events/guediawaye-1.jpg", focus: "center 18%" },
      { eyebrow: "Guédiawaye", title: "Prière et hadara", href: "/evenements/guediawaye", image: "/events/guediawaye-2.jpg", focus: "center 18%" },
      { eyebrow: "Guédiawaye", title: "Prière et hadara", href: "/evenements/guediawaye", image: "/events/guediawaye-3.jpg", focus: "center 20%" },
    ],
    introTitle: "La Nouvelle Génération",
    introLede: "Ce mouvement de jeunesse béni a pour vocation de sensibiliser les jeunes, de purifier les âmes et d’y inculquer les vertus et les bonnes valeurs.",
    introPoints: [
      "Fondé par Seydina Aliou Cissé, fils de l’Imam Cheikh Tidiane Cissé, qu’Allah soit satisfait de lui.",
      "Service, transmission et nouvelles générations.",
      "Ensemble pour le bien.",
    ],
    introMore: "Les objectifs",
    founderEyebrow: "À propos",
    founderTitle: "Mot du fondateur",
    founderParagraphs: [
      "Ce mouvement de jeunesse béni a pour vocation de sensibiliser les jeunes, de purifier les âmes et d’y inculquer les vertus et les bonnes valeurs.",
      "« Celui qui veut être avec moi, qu’il suive ma voie dans ses paroles et dans ses actes. »",
      "« J’aspire à l’agrément du Seigneur afin de soutenir Sa religion, et de présenter un modèle exemplaire à la nouvelle génération. »",
    ],
    founderName: "Seydina Aliou Cissé",
    founderLine: "Fils de l’Imam Cheikh Tidiane Cissé",
    aimsTitle: "Objectifs généraux",
    aimsLede: "Les objectifs généraux du mouvement se résument comme suit.",
    aims: [
      { title: "Connaissance mutuelle et fraternité", text: "Promouvoir la connaissance mutuelle et le rapprochement entre les peuples, tout en renforçant le sentiment d’appartenance à la grande fraternité islamique." },
      { title: "Patrimoine et voie du Cheikh", text: "Préserver le patrimoine islamique à travers la sagesse et la bonne exhortation, en s’attachant à la voie du Cheikh, qu’Allah soit satisfait de lui, et en étudiant ses enseignements." },
      { title: "L’époque et les principes immuables", text: "S’adapter aux évolutions et aux exigences de l’époque, tout en demeurant fermement attaché aux principes fondamentaux et aux valeurs immuables." },
      { title: "Unité de la Fayda", text: "Rejeter les divisions et les conflits entre les membres de la Fayda, et œuvrer à l’unité, au rapprochement et à l’unification des rangs." },
    ],
  },
  en: {
    communique: "The International Day of Imam Cheikh Tidiane Cissé, 24 January 2027, at the King Fahd Palace Hotel, Dakar.",
    communiqueLabel: "Communiqué",
    slides: [
      { eyebrow: "24 January 2027", title: "Imam Day", href: "/evenements/imam-day", image: "/events/imam-day.jpg", fit: "contain" },
      { eyebrow: "Home", title: "The New Generation", href: "#mouvement", image: "/brand/intro-lecon.jpg", focus: "center 78%" },
      { eyebrow: "The programme", title: "General aims", href: "#objectifs", image: "/brand/intro-lecon.jpg", focus: "center 75%" },
      { eyebrow: "Event", title: "Ansaroudine Day", href: "/evenements/ansaroudine", image: "/events/ansaroudine-1.jpg", focus: "center 22%" },
      { eyebrow: "Morocco", title: "Ansaroudine Day", href: "/evenements/ansaroudine", image: "/events/ansaroudine-2.jpg", focus: "center 24%" },
      { eyebrow: "Morocco", title: "Ansaroudine Day", href: "/evenements/ansaroudine", image: "/events/ansaroudine-3.jpg", focus: "center 20%" },
      { eyebrow: "Event", title: "Friday prayer and hadara", href: "/evenements/guediawaye", image: "/events/guediawaye-1.jpg", focus: "center 18%" },
      { eyebrow: "Guédiawaye", title: "Friday prayer and hadara", href: "/evenements/guediawaye", image: "/events/guediawaye-2.jpg", focus: "center 18%" },
      { eyebrow: "Guédiawaye", title: "Friday prayer and hadara", href: "/evenements/guediawaye", image: "/events/guediawaye-3.jpg", focus: "center 20%" },
    ],
    introTitle: "The New Generation",
    introLede: "This blessed youth movement exists to awaken the young, to purify souls, and to plant in them virtue and sound values.",
    introPoints: [
      "Founded by Seydina Aliou Cissé, son of Imam Cheikh Tidiane Cissé, may Allah be pleased with him.",
      "Service, transmission and new generations.",
      "Together for the good.",
    ],
    introMore: "The aims",
    founderEyebrow: "About",
    founderTitle: "Word of the founder",
    founderParagraphs: [
      "This blessed youth movement exists to awaken the young, to purify souls, and to plant in them virtue and sound values.",
      "“Whoever wants to be with me, let him follow my path in his words and in his deeds.”",
      "“I seek the pleasure of the Lord, so as to uphold His religion and to offer an exemplary model to the new generation.”",
    ],
    founderName: "Seydina Aliou Cissé",
    founderLine: "Son of Imam Cheikh Tidiane Cissé",
    aimsTitle: "General aims",
    aimsLede: "The general aims of the movement are these.",
    aims: [
      { title: "Mutual knowledge and brotherhood", text: "To foster mutual knowledge and closeness among peoples, and to strengthen belonging to the great Islamic brotherhood." },
      { title: "Heritage and the Shaykh’s path", text: "To preserve the Islamic heritage through wisdom and good counsel, holding to the path of the Shaykh, may Allah be pleased with him, and studying his teachings." },
      { title: "The age and the unchanging principles", text: "To meet the demands of the age while remaining firmly attached to the fundamental principles and the values that do not change." },
      { title: "Unity of the Fayda", text: "To refuse divisions and conflict among the people of the Fayda, and to work for unity and the joining of the ranks." },
    ],
  },
  ar: {
    communique: "اليوم الدولي للإمام الشيخ تجاني سيسي، 24 يناير 2027، بفندق قصر الملك فهد، دكار.",
    communiqueLabel: "بلاغ",
    slides: [
      { eyebrow: "24 يناير 2027", title: "يوم الإمام", href: "/evenements/imam-day", image: "/events/imam-day.jpg", fit: "contain" },
      { eyebrow: "الرئيسية", title: "الجيل الجديد", href: "#mouvement", image: "/brand/intro-lecon.jpg", focus: "center 78%" },
      { eyebrow: "البرنامج", title: "الأهداف العامة", href: "#objectifs", image: "/brand/intro-lecon.jpg", focus: "center 75%" },
      { eyebrow: "فعالية", title: "يوم الأنصارودين", href: "/evenements/ansaroudine", image: "/events/ansaroudine-1.jpg", focus: "center 22%" },
      { eyebrow: "المغرب", title: "يوم الأنصارودين", href: "/evenements/ansaroudine", image: "/events/ansaroudine-2.jpg", focus: "center 24%" },
      { eyebrow: "المغرب", title: "يوم الأنصارودين", href: "/evenements/ansaroudine", image: "/events/ansaroudine-3.jpg", focus: "center 20%" },
      { eyebrow: "فعالية", title: "صلاة الجمعة والحضرة", href: "/evenements/guediawaye", image: "/events/guediawaye-1.jpg", focus: "center 18%" },
      { eyebrow: "غيديواي", title: "صلاة الجمعة والحضرة", href: "/evenements/guediawaye", image: "/events/guediawaye-2.jpg", focus: "center 18%" },
      { eyebrow: "غيديواي", title: "صلاة الجمعة والحضرة", href: "/evenements/guediawaye", image: "/events/guediawaye-3.jpg", focus: "center 20%" },
    ],
    introTitle: "الجيل الجديد",
    introLede: "هذه الحركة الشبابية المباركة غايتها توعية الشباب، وتزكية النفوس، وغرس الفضائل والقيم فيها.",
    introPoints: [
      "أسسها سيدنا علي سيسي، نجل الإمام الشيخ تجاني سيسي، رضي الله عنه.",
      "خدمة، وتبليغ، وأجيال جديدة.",
      "معاً من أجل الخير.",
    ],
    introMore: "الأهداف",
    founderEyebrow: "عن الحركة",
    founderTitle: "كلمة المؤسس",
    founderParagraphs: [
      "هذه الحركة الشبابية المباركة غايتها توعية الشباب، وتزكية النفوس، وغرس الفضائل والقيم فيها.",
      "« من أراد أن يكون معي فليتبع سبيلي في أقواله وأفعاله. »",
      "« أرجو رضى الرب لأعين دينه، وأقدّم للجيل الجديد قدوة حسنة. »",
    ],
    founderName: "سيدنا علي سيسي",
    founderLine: "نجل الإمام الشيخ تجاني سيسي",
    aimsTitle: "الأهداف العامة",
    aimsLede: "تتلخص الأهداف العامة للحركة فيما يلي.",
    aims: [
      { title: "التعارف والأخوة", text: "تعزيز التعارف والتقارب بين الشعوب، وترسيخ الانتماء إلى الأخوة الإسلامية الكبرى." },
      { title: "التراث وسبيل الشيخ", text: "حفظ التراث الإسلامي بالحكمة والموعظة الحسنة، مع التمسك بسبيل الشيخ، رضي الله عنه، ودراسة تعاليمه." },
      { title: "العصر والمبادئ الثابتة", text: "مواكبة تطورات العصر ومتطلباته، مع الثبات على المبادئ الأساسية والقيم التي لا تتبدل." },
      { title: "وحدة الفيضة", text: "رفض الفرقة والنزاع بين أهل الفيضة، والعمل على الوحدة والتقارب وجمع الصف." },
    ],
  },
};

const VOICES: Record<Locale, { title: string; lede: string; partnersTitle: string; items: TestimonialCard[] }> = {
  fr: {
    title: "Témoignages",
    lede: "Ce que disent celles et ceux qui marchent avec le mouvement.",
    partnersTitle: "Partenaires",
    items: [
      { id: "aissatou", author: "Aïssatou Ndiaye", relation: "parent", content: "Le mouvement donne aux jeunes un cadre de fraternité et de bonnes valeurs. On s’y sent accompagnés." },
      { id: "moussa", author: "Moussa Fall", relation: "member", content: "Suivre la voie dans les paroles et dans les actes : c’est ce que j’ai trouvé ici." },
      { id: "fatou", author: "Fatou Ba", relation: "member", content: "La nouvelle génération a besoin de cette unité. Le mouvement nous rapproche." },
      { id: "ibrahima", author: "Ibrahima Diop", relation: "parent", content: "Nos jeunes y apprennent le respect, la sagesse et le sens du bien commun." },
      { id: "marieme", author: "Marième Sarr", relation: "member", content: "Ensemble pour le bien n’est pas un slogan. C’est ainsi que le mouvement nous rassemble." },
    ],
  },
  en: {
    title: "Testimonials",
    lede: "What those who walk with the movement say.",
    partnersTitle: "Partners",
    items: [
      { id: "aissatou", author: "Aïssatou Ndiaye", relation: "parent", content: "The movement gives the young a setting of brotherhood and sound values. We feel accompanied." },
      { id: "moussa", author: "Moussa Fall", relation: "member", content: "To follow the path in words and in deeds: that is what I found here." },
      { id: "fatou", author: "Fatou Ba", relation: "member", content: "The new generation needs this unity. The movement draws us closer." },
      { id: "ibrahima", author: "Ibrahima Diop", relation: "parent", content: "Our young people learn respect, wisdom and the sense of the common good." },
      { id: "marieme", author: "Marième Sarr", relation: "member", content: "Together for the good is not a slogan. It is how the movement gathers us." },
    ],
  },
  ar: {
    title: "شهادات",
    lede: "ما يقوله الذين يسيرون مع الحركة.",
    partnersTitle: "الشركاء",
    items: [
      { id: "aissatou", author: "Aïssatou Ndiaye", relation: "parent", content: "تمنح الحركة الشباب إطار أخوة وقيم حسنة. نشعر فيها بالمرافقة." },
      { id: "moussa", author: "Moussa Fall", relation: "member", content: "اتباع السبيل في الأقوال والأفعال: هذا ما وجدته هنا." },
      { id: "fatou", author: "Fatou Ba", relation: "member", content: "الجيل الجديد يحتاج إلى هذه الوحدة. الحركة تقرّب بيننا." },
      { id: "ibrahima", author: "Ibrahima Diop", relation: "parent", content: "يتعلم شبابنا الاحترام والحكمة ومعنى الخير المشترك." },
      { id: "marieme", author: "Marième Sarr", relation: "member", content: "معاً من أجل الخير ليس شعاراً. هكذا تجمعنا الحركة." },
    ],
  },
};

const PARTNERS: PartnerLogo[] = [
  { id: "imams", name: "Association des Imams du Sénégal", logoUrl: "/brand/slide-priere.jpg", websiteUrl: null },
  { id: "biblio", name: "Bibliothèque Islamique de Dakar", logoUrl: "/brand/slide-academique.jpg", websiteUrl: null },
  { id: "radio", name: "Radio Fréquence Islam", logoUrl: "/brand/slide-live.jpg", websiteUrl: null },
  { id: "fondation", name: "Fondation Éducation & Coran", logoUrl: "/brand/slide-centre.jpg", websiteUrl: null },
  { id: "clinique", name: "Clinique solidaire Sud Foire", logoUrl: "/brand/slide-actualites.jpg", websiteUrl: null },
  { id: "zawiya", name: "Collectif des Zawiya de Dakar", logoUrl: "/brand/slide-zawiya-soir.png", websiteUrl: null },
  { id: "recitation", name: "Institut de Récitation Medina", logoUrl: "/brand/slide-recitation.jpg", websiteUrl: null },
  { id: "edition", name: "Maison de l’Édition Islamique", logoUrl: "/brand/slide-replay.jpg", websiteUrl: null },
];

function hrefOf(locale: string, href: string) {
  if (href.startsWith("#")) return href;
  return `/${locale}${href}`;
}

export function AboutView({ locale }: { locale: string }) {
  const lang: Locale = locale === "en" || locale === "ar" ? locale : "fr";
  const copy = COPY[lang];
  const arabic = lang === "ar";
  const slides: BannerSlide[] = copy.slides.map((slide) => ({
    ...slide,
    text: "",
    href: hrefOf(locale, slide.href),
    image: slide.image || "/brand/intro-lecon.jpg",
    focus: slide.focus || "center 35%",
    fit: slide.fit || "cover",
  }));

  return (
    <article>
      <div className="relative overflow-x-clip">
        <CommuniqueBar
          items={[{ id: "imam-day", text: copy.communique, href: `/${locale}/evenements/imam-day` }]}
          label={copy.communiqueLabel}
          listHref={`/${locale}/evenements`}
        />
        <BannerSlider slides={slides} />
        <AboutShortcuts locale={locale} />
      </div>

      <section id="mouvement" className="scroll-mt-24 nh-container grid items-center gap-8 py-16 lg:grid-cols-2">
        <div>
          <h2 className={`font-sans text-3xl font-extrabold tracking-tight text-primary sm:text-4xl ${arabic ? "font-arabic" : ""}`}>
            {copy.introTitle}
          </h2>
          <p className={`mt-4 text-content-secondary ${arabic ? "font-arabic" : ""}`}>{copy.introLede}</p>
          <ul className={`mt-6 space-y-2 text-small text-content ${arabic ? "font-arabic" : ""}`}>
            {copy.introPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <a
            href="#objectifs"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-small font-semibold text-on-primary transition hover:bg-primary-hover"
          >
            {copy.introMore}
          </a>
        </div>
        <div className="relative min-h-72 overflow-hidden rounded-lg">
          <Image src="/brand/intro-lecon.jpg" alt="" fill sizes="640px" className="object-cover object-center" />
        </div>
      </section>

      <section id="fondateur" className="scroll-mt-24 bg-[#f3f4f6] py-16">
        <div className="nh-container grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <span aria-hidden="true" className="absolute -start-3 top-6 bottom-6 w-10 rounded-sm bg-primary sm:-start-5 sm:w-14" />
            <div className="relative overflow-hidden rounded-sm bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f7f3ea]">
                <Image
                  src="/brand/seydina-aliou.jpg"
                  alt={copy.founderName}
                  fill
                  unoptimized
                  sizes="(min-width: 64rem) 28vw, 80vw"
                  className="object-cover object-top bg-white"
                />
              </div>
            </div>
          </div>
          <div>
            <p className={`text-small font-semibold uppercase tracking-wide text-primary ${arabic ? "font-arabic" : ""}`}>
              {copy.founderEyebrow}
            </p>
            <h2 className={`mt-2 font-sans text-3xl font-extrabold text-content-accent sm:text-4xl ${arabic ? "font-arabic" : ""}`}>
              {copy.founderTitle}
            </h2>
            <div className={`mt-6 space-y-4 text-content ${arabic ? "font-arabic" : ""}`}>
              {copy.founderParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className={`mt-8 text-end text-xl text-content-accent ${arabic ? "font-arabic" : "italic"}`}>
              {copy.founderName}
            </p>
            <p className={`text-end text-small text-content-secondary ${arabic ? "font-arabic" : ""}`}>
              {copy.founderLine}
            </p>
          </div>
        </div>
      </section>

      <section id="objectifs" className="scroll-mt-24 bg-brand-900 py-14 text-white">
        <div className="nh-container">
          <h2 className={`text-center font-sans text-3xl font-extrabold text-white ${arabic ? "font-arabic" : ""}`}>
            {copy.aimsTitle}
          </h2>
          <p className={`mx-auto mt-3 max-w-2xl text-center text-small text-white/75 ${arabic ? "font-arabic" : ""}`}>
            {copy.aimsLede}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {copy.aims.map((aim) => (
              <article key={aim.title} className="nh-mission-card nh-mission-card--light nh-mission-card--visible">
                <div className="nh-mission-card__inner flex h-full flex-col p-6 text-center">
                  <h3 className={`nh-mission-card__title font-sans text-lg font-bold ${arabic ? "font-arabic" : ""}`}>{aim.title}</h3>
                  <p className={`nh-mission-card__text mt-3 flex-1 text-small ${arabic ? "font-arabic" : ""}`}>{aim.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f4f6] py-14">
        <div className="nh-container">
          <h2 className={`text-center font-sans text-3xl font-extrabold text-primary ${arabic ? "font-arabic" : ""}`}>
            {VOICES[lang].title}
          </h2>
          <p className={`mx-auto mt-3 max-w-2xl text-center text-small text-content-secondary ${arabic ? "font-arabic" : ""}`}>
            {VOICES[lang].lede}
          </p>
          <TestimonialsCarousel items={VOICES[lang].items} />
        </div>
      </section>

      <section className="border-y border-primary/15 bg-primary/[0.06] py-12">
        <div className="nh-container">
          <h2 className={`text-center font-sans text-3xl font-extrabold text-primary ${arabic ? "font-arabic" : ""}`}>
            {VOICES[lang].partnersTitle}
          </h2>
          <PartnersMarquee items={PARTNERS} />
        </div>
      </section>
    </article>
  );
}
