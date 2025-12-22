import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaTimes, FaPills, FaComment, FaReply, FaUser } from "react-icons/fa";
import supabase from "../utils/supabase";
import PatientDetails from "./PatientDetails";
import MedicationHistory from "./MedicationHistory";
import DrnAssessment from "./DrnAssessment";
import Phassistplan from "./Phassistplan";
import Patientoutcome from "./Patientoutcome";
import Costsection from "./Costsection";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patientCode, setPatientCode] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [labData, setLabData] = useState("");
  const [imagingResults, setImagingResults] = useState("");
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showMedicationHistory, setShowMedicationHistory] = useState(false);
  const [showDrnAssessment, setShowDrnAssessment] = useState(false);
  const [showPhAssistPlan, setShowPhAssistPlan] = useState(false);
  const [showPatientOutcome, setShowPatientOutcome] = useState(false);
  const [showCostSection, setShowCostSection] = useState(false);
  const [resourceLinks, setResourceLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [searchLink, setSearchLink] = useState("");
  const [showLinks, setShowLinks] = useState(true);
  const [allPatientCodes, setAllPatientCodes] = useState([]);
  const [filteredPatientCodes, setFilteredPatientCodes] = useState([]);
  const [showPatientCodesDropdown, setShowPatientCodesDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComprehensiveMedicationManagement, setShowComprehensiveMedicationManagement] = useState(false);
  const [showUsefulLinks, setShowUsefulLinks] = useState(false);
  const [showMedicationInformation, setShowMedicationInformation] = useState(false);
  const [showMinorIllness, setShowMinorIllness] = useState(false);
  const [showExtemporaneousPreparation, setShowExtemporaneousPreparation] = useState(false);
  const [showHomeRemedies, setShowHomeRemedies] = useState(false);
  const [showMedicationAvailability, setShowMedicationAvailability] = useState(false);
  const [error, setError] = useState("");
  const [searchPatientCode, setSearchPatientCode] = useState("");
  const [medicationData, setMedicationData] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [searchMedication, setSearchMedication] = useState("");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [minorIllnessData, setMinorIllnessData] = useState([]);
  const [filteredMinorIllness, setFilteredMinorIllness] = useState([]);
  const [searchMinorIllness, setSearchMinorIllness] = useState("");
  const [selectedMinorIllness, setSelectedMinorIllness] = useState(null);
  const [showMinorIllnessModal, setShowMinorIllnessModal] = useState(false);
  const [extemporaneousPreparationData, setExtemporaneousPreparationData] = useState([]);
  const [filteredExtemporaneousPreparation, setFilteredExtemporaneousPreparation] = useState([]);
  const [searchExtemporaneousPreparation, setSearchExtemporaneousPreparation] = useState("");
  const [selectedExtemporaneousPreparation, setSelectedExtemporaneousPreparation] = useState(null);
  const [showExtemporaneousPreparationModal, setShowExtemporaneousPreparationModal] = useState(false);
  const [homeRemediesData, setHomeRemediesData] = useState([]);
  const [filteredHomeRemedies, setFilteredHomeRemedies] = useState([]);
  const [searchHomeRemedies, setSearchHomeRemedies] = useState("");
  const [selectedHomeRemedies, setSelectedHomeRemedies] = useState(null);
  const [showHomeRemediesModal, setShowHomeRemediesModal] = useState(false);
  const [medicationAvailabilityData, setMedicationAvailabilityData] = useState([]);
  const [filteredMedicationAvailability, setFilteredMedicationAvailability] = useState([]);
  const [searchMedicationAvailability, setSearchMedicationAvailability] = useState("");
  const [selectedMedicationAvailability, setSelectedMedicationAvailability] = useState(null);
  const [showMedicationAvailabilityModal, setShowMedicationAvailabilityModal] = useState(false);
  const [newMedicationPost, setNewMedicationPost] = useState({
    medication_name: "",
    location: "",
    details: "",
    contact: "",
    availability_status: "available"
  });
  const [replyText, setReplyText] = useState("");
  const [replyingToPostId, setReplyingToPostId] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        navigate("/login");
      } else {
        setUser(data.user);
        fetchAllPatientCodes();
        fetchMedicationAvailability();
      }
    } catch (err) {
      setError("Failed to fetch user: " + err.message);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUser();
    fetchLinks();
    fetchMedications();
    fetchMinorIllness();
    fetchExtemporaneousPreparation();
    fetchHomeRemedies();
  }, [fetchUser]);

  // Fetch Medication Availability Data - similar to minor illness
  const fetchMedicationAvailability = async () => {
    try {
      // Sample medication availability data
      const sampleMedicationAvailability = [
        {
          id: 1,
          medication_name: "Paracetamol 500mg",
          location: "Addis Ababa, Bole",
          details: "Available in boxes of 100 tablets. Brand: Generic",
          contact: "Pharmacy: 0911------",
          availability_status: "available",
          posted_by: "pharmacy@example.com",
          posted_date: "2024-01-15",
          replies: [
            {
              id: 1,
              reply_text: "Do you have the syrup form as well?",
              replied_by: "user2@example.com",
              reply_date: "2024-01-16"
            },
            {
              id: 2,
              reply_text: "Yes, we have Paracetamol syrup 120ml available.",
              replied_by: "pharmacy@example.com",
              reply_date: "2024-01-16"
            }
          ]
        },
        {
          id: 2,
          medication_name: "Insulin Glargine",
          location: "Addis Ababa, Piazza",
          details: "Looking for Insulin Glargine pens. Out of stock in my area.",
          contact: "Contact: 0922----",
          availability_status: "needed",
          posted_by: "user2",
          posted_date: "2024-01-14",
          replies: [
            {
              id: 1,
              reply_text: "Check with St. Paul Hospital pharmacy, they had stock yesterday.",
              replied_by: "helper@example.com",
              reply_date: "2024-01-15"
            }
          ]
        },
        {
          id: 3,
          medication_name: "Amoxicillin 250mg/5ml",
          location: "Addis Ababa, Megenagna",
          details: "Suspension available. Expiry: 2025-06",
          contact: "Pharmacy: 0933------",
          availability_status: "available",
          posted_by: "pc pharmacy",
          posted_date: "2024-01-13",
          replies: []
        }
      ];

      setMedicationAvailabilityData(sampleMedicationAvailability);
      setFilteredMedicationAvailability(sampleMedicationAvailability);
    } catch (err) {
      setError("Error fetching medication availability: " + err.message);
    }
  };

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase.from("resource_links").select("*");
      if (error) {
        throw new Error(error.message);
      }
      setResourceLinks(data || []);
      setFilteredLinks(data || []);
    } catch (err) {
      setError("Error fetching links: " + err.message);
    }
  };

  const fetchMedications = async () => {
    try {
      // Sample medication data
      const sampleMedications = [
        {
          id: 1,
          name: "Paracetamol",
          amharic_name: `ፓራሲታሞል`,
          usage: `- ህመምን እና ትኩሳትን ለማስታገስ ጥቅም ላይ ይውላል`,
          before_taking: `- ለዚህ መድሃኒት ወይም ለሌላ መድሃኒት፣ ለምግብ ወይም ሌሎች ነገሮች አለርጂ ካለብዎ ወይም የሚከተሉትን ምልክቶች ካዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት፤ ወይም ሌላ ማንኛውም ምልክቶች
- በጣም ከባድ የሆነ የጉበት ህመም ካለብዎት`,
          while_taking: `- መድሃኒቱ ህመሙን ካላሻለልዎት ሀኪምዎን ያማክሩ`,
          side_effects: `- የሆድ ህመም ወይም ማስታወክ፤ 
- በጣም ጥቂት ሰዎች ላይ ጉበት ላይ የሚደርስ ጉዳት ሊከሰት ይችላል፤ በተለይ ከፍተኛ መጠን ሲወሰድ።`,
          serious_side_effects: `- የአለርጂ ምልክቶች ከታዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት የመሳሰሉት 
- ከታዘዘው መጠን በላይ እንደወሰዱ ካሰቡ 
- በጣም ከባድ የሆነ የሆድ ህመም ወይም ማስታወክ፤ 
- ቆዳዎ ወይም አይኖችዎ ቢጫ ከሆኑ`,
          how_to_take: `- በአፍ የሚዋጥ እንክብል ወይም የሚጠጣ ፈሳሽ
- በፊንጢጣ የሚገባ (ሰፖዚተሪ)`,
          missed_dose: `- ብዙ ጊዜ ይህ መድሃኒት እንደ አስፈላጊነቱ የሚወሰድ ነው`,
          storage: `- እንክብሉን፣ ፈሳሹን ወይም በፊንጢጣ የሚሰጠውን ሰፖዚተሪ በደረቅ ቦታ (~25°C) ያስቀምጡ፤ እርጥበታማ ቦታ አያስቀምጡ።
- መድሃኒቱን ህጻናት በማይደርሱበት ቦታ ያስቀምጡት።`
        },
        {
          id: 2,
          name: "Enalapril",
          amharic_name: `ኤናላፕሪል`,
          usage: `-	ለደም ግፊት ህመም፣
-	ለልብ ህመም፣ 
-	ለስኳር ህመምተኞች የኩላሊት ሥራን ለመጠበቅ`,
          before_taking: `-	ለዚህ መድሃኒት ወይም ለሌላ መድሃኒት፣ ለምግብ ወይም ሌሎች ነገሮች አለርጂ ካለብዎ ወይም የሚከተሉትን ምልክቶች ካዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት፤ ወይም ሌላ ማንኛውም ምልክቶች
-	በኩላሊት ደም ወሳጅ ቧንቧዎች ውስጥ መዘጋት ካለ፣ በሰውነት ውስጥ የአልዶስቴሮን መብዛት ካለ 
-	እርጉዝ ከሆኑ ወይም እርግዝና ከጠረጠሩ`,
          while_taking: `-	የሚወስዱትን ሁሉንም መድሃኒቶች ዝርዝር (ያለሐኪም ትዕዛዝ የሚወሰዱትንም) ለሐኪምዎ ያሳውቁ
-	ይህ መድሃኒት አይለቅብዎ
-	በእርግዝና ወቅት ስለማይወሰድ ይህንን መድሃኒት በሚወስዱበት ጊዜ እርግዝናን ለማስቀረት የወሊድ መከላከያ ይጠቀሙ፤ ጡት እያጠቡ ከሆነም ለሐኪምዎ ይንገሩ
-	የኩላሊት ህመም ካለ
-	የደም ግፊትዎን በተከታታይ ይለኩ፣ ሐኪምዎንም ያማክሩ 
-	ይህ መድሃኒት በሚወሰድበት በ 2 ሰዓታት ጊዜ ውስጥ አንቲአሲዶችን (የጨጓራ ህመም ማስታገሻዎችን) አይውሰዱ
-	ይህንን መድሃኒት እየወሰዱ ከፍተኛ የደም ግፊት ካለዎት ያለሐኪም ትዕዛዝ የሚወሰዱ የማስታገሻ መድሃኒቶችን፣ የሳል መድሃኒቶችን፣ የጉንፋን መድሃኒቶችን ከመውሰድዎ በፊት ሐኪምዎን ያማክሩ፤ የደም ግፊቱን ሊጨምሩት ስለሚችሉ
-	የአልኮል መጠጦችን ከመጠጣት ይገደቡ
-	በሞቃት የአየር ጠባይ የሰውነት ፈሳሽን ለመጠበቅ ፈሳሽ ይጠጡ`,
          side_effects: `-	የማዞር ስሜት፤ ከተቀመጡት ወይም ከተኙበት ሲነሱ በዝግታ ይሁን። ከፍታን መውጣት ሲያስቡ በጥንቃቄ ይሁን።
-	በደም ውስጥ ከፍ ያለ የፖታሽየም መጠን፤ ምልክቶቹም የድካም ስሜት፣ መፍዘዝ፣ ማዞር፣ ራስን የመሳት ስሜት፣ የመደንዘዝ ወይም የመጠዝጠዝ ስሜትን ያካትታሉ።
-	ራስ ምታት
-	በአፍዎ ውስጥ መጥፎ ጣዕም፤ ይህ ብዙውን ጊዜ የሚስተካከል ነው።
-	ሳል`,
          serious_side_effects: `-	ከታዘዘው መጠን በላይ እንደወሰዱ ካሰቡ 
-	የአለርጂ ምልክቶች ከታዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት የመሳሰሉት 
-	የኢንፌክሽን ምልክቶች ከታዩ ለምሳሌ ትኩሳት፣ ብርድ ብርድ ማለት፣ የጉሮሮ መቁሰል፣ የጆሮ ወይም የሳይነስ ህመም፣ ሳል፣ የአክታ መጨመር ወይም የአክታ ቀለም መቀየር፣ በሚሸኑ ጊዜ የሚሰማ ህመም፣ የአፍ ቁስል፣ የማይድን ቁስል፣ የፊንጢጣ ማሳከክ ወይም ህመም
-	ከባድ የማዞር ስሜት
-	የመተንፈስ ችግር
-	ብዙ ላበት፣ የሰውነት ፈሳሽ እጥረት፣ ትውከት ወይም ተቅማጥ ካለ ለሀኪምዎ ይንገሩ፤ ይህ ወደ ዝቅተኛ የደም ግፊት ሊመራ ይችላል።
-	�የሰውነት እብጠት
-	የማይጠፋ ሳል
-	አንጂዮኢዴማ (angioedema) የምንለው አጋጥሞዎት ከሆነ። ምልክቶቹም የእጅ፣ የፊት፣ የከንፈር፣ የአይን፣ የምላስ እና የጉሮሮ እብጠት፤ የመተንፈስ ችግር፤ የመዋጥ ችግር፤ ወይም ያልተለመደ የድምጽ መጎርነን ሊሆኑ ይችላሉ።
-	የሽንት ቀለም መጥቆር፣ ቆዳዎ ወይም አይኖችዎ ቢጫ ከሆኑ
-	ማንኛውም ሽፍታ`,
          how_to_take: `-	ምንም እንኳን ጥሩ ስሜት ቢሰማዎትም በተነገርዎ መጠን ይውሰዱ
-	ከምግብ ጋር ወይም ያለ ምግብ መውሰድ ይችላሉ፤ የጨጓራ ህመም የሚያስከትል ከሆነ ከምግብ ጋር ይውሰዱ።
-	ሐኪምዎ የነገረዎትን የአካል ብቃት እንቅስቃሴ ዓይነት በመከተል
-	በእንክብል መልክ የተዘጋጀና በአፍ የሚዋጥ 
-	እንክብሎችን መዋጥ ካልቻሉ በፈሳሽ መልክ (ሰስፔንሽን) አለ። ፈሳሹን ከመጠቀምዎ በፊት በደንብ ይነቅንቁት።`,
          missed_dose: `-	ልክ እንዳስታወሱ ያለፈዎትን መጠን ይውሰዱ፤ ነገር ግን ቀጣዩን የሚወስዱበት ጊዜ ከተቃረበ ያለፈዎትን ይዝለሉ እና ወደ መደበኛው የሚወስዱበት ጊዜዎ ይመለሱ።
-	በተመሳሳይ ጊዜ 2 መጠን ወይም ተጨማሪ መጠን አይወስዱ
-	መጠኑን አይቀይሩ ወይም ይህን መድሃኒት አያቁሙ፤ ሐኪምዎን ያማክሩ`,
          storage: `-	እንክብሉን በደረቅ ቦታ (~25°C) ያስቀምጡ፤ እርጥበታማ ቦታ አያስቀምጡ።
-	ፈሳሹን (ሰስፔንሽኑን) በማቀዝቀዣ (በፍሪጅ) ውስጥ ያስቀምጡ፣ ከ 1 ወር በኋላ ጥቅም ላይ ያልዋለውን መጠን ይጣሉት።`
        },
        {
          id: 3,
          name: "Prednisolone",
          amharic_name: `ፕሬድንሶሎን`,
          usage: `-	ከኢሚውን ሲስተም ጋር የሚገናኙ ህመሞችን ለማከም፣ ለአለርጂ ፣ ለአስም፣ ለአርትራይተስ (የመገጣጠሚያ ህመም)፣ ለተመረጡ የደም ካንሰር ህመሞች፣ እብጠትን የሚያስከትሉ የኢሚውን ሲስተም ህመሞችን ለማከም፣ ወዘተ`,
          before_taking: `-	ለዚህ መድሃኒት ወይም ለሌላ መድሃኒት፣ ለምግብ ወይም ሌሎች ነገሮች አለርጂ ካለብዎ ወይም የሚከተሉትን ምልክቶች ካዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ �እብጠት፤ ወይም ሌላ ማንኛውም ምልክቶች
-	ከባድ ኢንፌክሽን ህመም ካለብዎት`,
          while_taking: `-	ይህንን መድሃኒት ለብዙ ሳምንታት ከወሰዱ፣ ከማቆምዎ በፊት ከሐኪምዎ ጋር ይነጋገሩ፤ ይህን መድሃኒት ቀስ በቀስ ማቆም ያስፈልግ ይሆናል።
-	ማንኛውንም ክትባት ከመውሰድዎ በፊት ከሐኪምዎ ጋር ይነጋገሩ። 
-	ይህ መድሃኒት አይለቅብዎ
-	የጉድፍ ወይም ኩፍኝ በሽታ ካለበት ሰው ጋር ከመቀራረብ ይቆጠቡ።
-	ይህ መድሃኒት በሚወሰድበት በ 2 ሰዓታት ጊዜ ውስጥ አንቲአሲዶችን (የጨጓራ ህመም ማስታገሻዎችን) አይውሰዱ
-	ከፍተኛ የደም ስኳር (የስኳር ህመም) ካለብዎ ሐኪምዎን ያነጋግሩ፤ ይህ መድሃኒት በደም ውስጥ ያለውን የስኳር መጠን ከፍ ሊያደርግ ይችላል
-	በዶክተርዎ እንደተነገሩት የደምዎን ስኳር መጠን ይለኩ
-	የሚወስዱትን ሁሉንም መድሃኒቶች ዝርዝር (ያለሐኪም ትዕዛዝ የሚወሰዱትንም) ለሐኪምዎ ያሳውቁ
-	ግላኮማ ወይም የዓይን ሞራ ግርዶሽ ካለብዎ ሐኪምዎን ያነጋግሩ
-	ከፍተኛ የደም ግፊት ካለብዎ ሐኪምዎን ያነጋግሩ
-	ለማንኛውም ኢንፌክሽን እየታከሙ ከሆነ ሐኪምዎን ያነጋግሩ
-	የአጥንት መሳሳት ካለብዎ ሐኪምዎን ያነጋግሩ
-	የጨጓራ ህመም ካለብዎ ሐኪምዎን ያነጋግሩ
-	ቲቢ ካለብዎ ሐኪምዎን ያነጋግሩ
-	የልብ ህመም ካለብዎ ሐኪምዎን ያነጋግሩ
-	ይህንን መድሃኒት እንደሚጠቀሙ ለጥርስ ሀኪሞች፣ ለቀዶ ጥገና ሐኪሞች እና ለሌሎች ዶክተሮች ይንገሩ፤ ለህክምና እነዚህ ሐኪሞች ጋር የሚሄዱ ከሆነ።
-	የአልኮል መጠጦችን ከመጠጣት ይገደቡ
-	እርጉዝ ከሆኑ ወይም ለማርገዝ ካሰቡ ሐኪምዎን ያማክሩ፤ ጡት እያጠቡ ከሆነም ለሐኪምዎ ይንገሩ።`,
          side_effects: `-	በደም ውስጥ ያለውን የስኳር መጠን ከፍ ያደርጋል፤ ይህ ብዙውን ጊዜ መድሃኒቱ ሲቆም የሚስተካከል ነው።
-	በኢንፌክሽን የመያዝ እድል ይጨምራል፤ እጅዎን ብዙ ጊዜ ይታጠቡ፤ ኢንፌክሽን፣ ጉንፋን ካለባቸው ሰዎች ይራቁ።
-	የሆድ ህመም ወይም የምግብ አለመርጋት። ለዚህም ትንሽ ትንሽ  በተደጋጋሚ መመገብ፣ ጥሩ የአፍ እንክብካቤ፣ ከስኳር ነፃ የሆነ ከረሜላ ወይም ከስኳር ነፃ የሆነ ማስቲካ ማኘክ ሊረዳ ይችላል።
-	የክብደት መጨመር
-	የስሜት ለውጦች (mood changes)
-	የሰውነት ስብ ለውጦች
-	ለረጅም ጊዜ ሲወሰድ የአጥንት መሳሳት ሊያመጣ ይችላል።
-	የጡንቻ መድከም
-	የቆዳ ለውጦች (ብጉር፣ የቆዳ መሸብሸብ፣ ቁስል የሚድንበት ጊዜ መዘግየት፣ የፀጉር እድገት)
-	ለረጅም ጊዜ ሲወሰድ የዓይን ሞራ ግርዶሽ ወይም ግላኮማ ሊያመጣ ይችላል።
-	በሴቶች የሴት ብልት ፈንገስ ኢንፌክሽን ሊያመጣ ይችላል፣ ስለዚህ ማሳከክ ወይም ፈሳሽ ካለ ሪፖርት ያድርጉ።`,
          serious_side_effects: `-	ከታዘዘው መጠን በላይ እንደወሰዱ ካሰቡ 
-	የአለርጂ ምልክቶች ከታዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት የመሳሰሉት 
-	የኢንፌክሽን ምልክቶች ከታዩ ለምሳሌ ትኩሳት፣ ብርድ ብርድ ማለት፣ የጉሮሮ መቁሰል፣ የጆሮ ወይም የሳይነስ ህመም፣ ሳል፣ የአክታ መጨመር ወይም የአክታ ቀለም መቀየር፣ በሚሸኑ ጊዜ የሚሰማ ህመም፣ የአፍ ቁስል፣ የማይድን ቁስል፣ የፊንጢጣ ማሳከክ ወይም ህመም
-	መድሃኒቱን ሳይወስዱ ከቀሩ ወይም በቅርቡ ካቆሙ ከባድ የድካም ስሜት፣ መንቀጥቀጥ፣ ፈጣን የልብ ምት፣ የአዕምሮ መረበሽ (confusion)፣ ላብ ወይም ማዞር ሊያመጣ ይችላል።
-	የመተንፈስ ችግር
-	የጨጓራ ህመም ወይም የምግብ አለመርጋት። 
-	ከፍተኛ የክብደት መጨመር
-	ድንገተኛ የዓይን እይታ ለውጥ።
-	ማንኛውም ሽፍታ`,
          how_to_take: `-	በእንክብል መልክ የተዘጋጀና በአፍ የሚዋጥ 
-	በቀን አንድ ጊዜ የሚወስዱ ከሆነ ጠዋት ላይ ይውሰዱ
-	የጨጓራ ህመምን ለመቀነስ ከምግብ ጋር ይውሰዱ 
-	በዶክተርዎ ትዕዛዝ ካልሲየም እና ቫይታሚን ዲ አብረው ሊወስዱ ይችላሉ (ይህንን መድሃኒት ለረጅም ጊዜ የሚወስዱ ከሆነ)`,
          missed_dose: `-	ልክ እንዳስታወሱ ያለፈዎትን መጠን ይውሰዱ፤ ነገር ግን ቀጣዩን የሚወስዱበት ጊዜ ከተቃረበ ያለፈዎትን ይዝለሉ እና ወደ መደበኛው የሚወስዱበት ጊዜዎ ይመለሱ።
-	በተመሳሳይ ጊዜ 2 መጠን ወይም ተጨማሪ መጠን አይወስዱ
-	መጠኑን አይቀይሩ ወይም ይህን መድሃኒት አያቁሙ፤ ሐኪምዎን ያማክሩ`,
          storage: `-	እንክብሉን በደረቅ ቦታ (~25°C) ያስቀምጡ፤ እርጥበታማ ቦታ አያስቀምጡ።`
        },
        {
          id: 4,
          name: "Diclofenac gel topical",
          amharic_name: `ዳይክሎፌናክ ጄል የሚቀባ`,
          usage: `-	ህመምን ለማስታገስ 
-	የአርትራይተስ ህመምን (የመገጣጠሚያ ህመም) ለማከም`,
          before_taking: `-	ለዚህ መድሃኒት ወይም ለሌላ መድሃኒት፣ ለምግብ ወይም ሌሎች ነገሮች አለርጂ ካለብዎ ወይም የሚከተሉትን ምልክቶች ካዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት፤ ወይም ሌላ ማንኛውም ምልክቶች
-	የህመም ችግር ያለበት ቆዳ ላይ አይጠቀሙ`,
          while_taking: `-	የሚወስዱትን �ሁሉንም መድሃኒቶች ዝርዝር (ያለሐኪም ትዕዛዝ የሚወሰዱትንም) ለሐኪምዎ ያሳውቁ
-	እርጉዝ ከሆኑ ወይም ለማርገዝ ካሰቡ ሐኪምዎን ያማክሩ፤ ጡት እያጠቡ ከሆነም ለሐኪምዎ ይንገሩ።
-	ዳይክሎፌናክ የቆዳ ጄል ሲጠቀሙ፡- የተቀባው ላይ መሸፈኛዎችን (ፋሻዎችን፣ አልባሳትን፣ ሜካፕን) አይጠቀሙ፤ በሐኪምዎ ካልተነገሩ በስተቀር። በቀላሉ በፀሀይ የመቃጠል ስሜት ተጋላጭ ሊሆኑ ይችላሉ፤ ከፀሃይና ከአልጋ መብራት ራስዎን ይከላከሉ። የፀሀይ መከላከያ ይጠቀሙ እና ከፀሀይ የሚከላከሉ ልብሶችን እና የዓይን መነጽር ይልበሱ።`,
          side_effects: `-	የቆዳ መቆጣት
-	ማሳከክ`,
          serious_side_effects: `-	ከታዘዘው መጠን በላይ እንደወሰዱ ካሰቡ 
-	የአለርጂ ምልክቶች ከታዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት የመሳሰሉት 
-	የደረት ህመም
-	ማንኛውም ዓይነት ደም መፍሰስ
-	ከፍተኛ የቆዳ መቆጣት
-	ማንኛውም ሽፍታ`,
          how_to_take: `-	ይህንን መድሃኒት በአፍዎ አይውሰዱ፤ በቆዳዎ ላይ ብቻ ይጠቀሙ።
-	ከአፍዎ፣ ከአፍንጫዎ እና ከዓይንዎ ያርቁ (የማቃጠል ስሜት ይኖረዋል) 
-	ከመጠቀምዎ በፊት እና በኋላ እጅዎን ይታጠቡ። 
-	እጅዎ ላይ ከሆነ የሚቀቡት ከተቀቡ በኋላ እጅዎን አይታጠቡ። 
-	ከመጠቀምዎ በፊት የተጎዳውን ክፍል ያፅዱ። 
-	ዳይክሎፌናክ የቆዳ ጄል:- በተጎዳው ቆዳ ላይ በስሱ እና በቀስታ ይቀቡት፤ በተጎዳው ክፍል ላይ የፀሐይ መከላከያ ወይም ሌሎች መድሃኒቶችን አይጠቀሙ`,
          missed_dose: `-	ልክ እንዳስታወሱ ይውሰዱ፤ ነገር ግን ቀጣዩን የሚወስዱበት ጊዜ ከተቃረበ ያለፈዎትን ይዝለሉ እና ወደ መደበኛው የሚወስዱበት ጊዜዎ ይመለሱ።
-	በተመሳሳይ ጊዜ 2 መጠን ወይም ተጨማሪ መጠን አይወስዱ`,
          storage: `-	ዳይክሎፌናክ ጄልን በደረቅ ቦታ (~25°C) ያስቀምጡ፤ በረዶ መሆን የለበትም፤ ከሙቀት ይከላከሉ።`
        },
         {
          id: 5,
          name: "Insulin Regular or NPH",
          amharic_name: `ኢንሱሊን`,
          usage: `-	ከፍተኛ የደም ስኳር (የስኳር ህመም) ለማከም ያገለግላል`,
          before_taking: `-	ለዚህ መድሃኒት ወይም ለሌላ መድሃኒት፣ ለምግብ ወይም ሌሎች ነገሮች አለርጂ ካለብዎ ወይም የሚከተሉትን ምልክቶች ካዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት፤ ወይም ሌላ ማንኛውም ምልክቶች`,
          while_taking: `-	የሚወስዱትን ሁሉንም መድሃኒቶች ዝርዝር (ያለሐኪም ትዕዛዝ የሚወሰዱትንም) ለሐኪምዎ ያሳውቁ
-	ይህ መድሃኒት አይለቅብዎ
-	የደምዎ ስኳር መጠን ዝቅተኛ ከሆነ መኪና አያሽከርክሩ
-	የኩላሊት ህመም ካለብዎ ሐኪምዎን ያነጋግሩ፤ መድሃኒቱን በሚወስዱበት ጊዜ የታካሚውን ደህንነት ለመጠበቅ
-	በዶክተርዎ እንደተነገሩት የደምዎን ስኳር መጠን ይለኩ
-	የዓይን እና የእግር ምርመራ በሐኪምዎ ክትትል ያድርጉ 
-	የአልኮል መጠጦችን ከመጠጣት ይገደቡ
-	ስፖርታዊ እንቅስቃሴዎችን በተመሳሳይ መንገድ ይስሩ። ከተለመደው መጠን ከፍ ያሉ የአካል ብቃት እንቅስቃሴዎች የኢንሱሊን ፍላጎትን ሊቀንስ ይችላል
-	እርጉዝ ከሆኑ ወይም ለማርገዝ ካሰቡ ለሐኪምዎ ይንገሩ
-	ጡት እያጠቡ ከሆነ ለሐኪምዎ ይንገሩ`,
          side_effects: `-	ዝቅተኛ የደም ስኳር ሊከሰት ይችላል፤ ምልክቶቹ ማዞር፣ ራስ ምታት፣ የእንቅልፍ ስሜት፣ የድካም ስሜት፣ መንቀጥቀጥ፣ ፈጣን የልብ ምት፣ ረሃብ፣ ላብ፣ የአዕምሮ መረበሽ (confusion) ሊሆኑ ይችላሉ። ለዚህም ከረሜላዎችን፣ ጭማቂ፣ ከተገኘ የግሉኮስ እንክብል ወይም ፈሳሽ በእጅዎ ይያዙ።
-	የሆድ ህመም ወይም የምግብ አለመርጋት። ለዚህም ትንሽ ትንሽ  በተደጋጋሚ መመገብ፣ ጥሩ የአፍ እንክብካቤ፣ ከስኳር ነፃ የሆነ ከረሜላ ወይም ከስኳር ነፃ የሆነ ማስቲካ ማኘክ ሊረዳ ይችላል።
-	የክብደት መጨመር
-	መርፌው የሚወጋበት ቦታ የህመም ስሜት ሊኖር ይችላል።`,
          serious_side_effects: `-	ከታዘዘው መጠን በላይ እንደወሰዱ ካሰቡ 
-	የአለርጂ ምልክቶች ከታዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት የመሳሰሉት 
-	የኢንፌክሽን ምልክቶች ከታዩ ለምሳሌ ትኩሳት፣ ብርድ ብርድ ማለት፣ የጉሮሮ መቁሰል፣ የጆሮ ወይም የሳይነስ ህመም፣ ሳል፣ የአክታ መጨመር ወይም የአክታ ቀለም መቀየር፣ በሚሸኑ ጊዜ የሚሰማ ህመም፣ የአፍ ቁስል፣ የማይድን ቁስል፣ የፊንጢጣ ማሳከክ ወይም ህመም
-	በጣም ዝቅተኛ የደም ስኳር መጠን ወይም በጣም ከፍተኛ የደም ስኳር መጠን
-	ማንኛውም ሽፍታ`,
          how_to_take: `--	በጡንቻ፣ በደም ሥር ወይም በሰባው የቆዳ ክፍል ላይ በኢንሱሊን መርፌ ይሰጣል።
-	ምንም እንኳን ጥሩ ስሜት ቢሰማዎትም በተነገርዎ መጠንና መንገድ ይጠቀሙ።
-	መርፌዎችን በመርፌ/በስለታማ የማስወገጃ ሣጥን ውስጥ ይጣሉት 
-	ሐኪምዎ የነገረዎትን የአመጋገብ እና የአካል ብቃት እንቅስቃሴ እቅድ በመከተል`,
          missed_dose: `-	ልክ እንዳስታወሱ ያለፈዎትን መጠን ይውሰዱ፤ ነገር ግን ቀጣዩን የሚወስዱበት ጊዜ ከተቃረበ ያለፈዎትን ይዝለሉ እና ወደ መደበኛው የሚወጉበት ጊዜዎ ይመለሱ።`,
          storage: `-	ያልተከፈተውን የኢንሱሊን መያዣ ጠርሙስ በማቀዝቀዣ (በፍሪጅ) ውስጥ ያስቀምጡ፤ በረዶ መሆን የለበትም።
-	ከፀሐይ ብርሃን ይከላከሉ
-	የተከፈቱ የኢንሱሊን ጠርሙሶች ከማቀዝቀዣ ውጭ (~25°C) ወይም በማቀዝቀዣ (በፍሪጅ) ውስጥ ማስቀመጥ ይችላሉ። የተከፈተውን የኢንሱሊን ጠርሙስ ከማቀዝቀዣ ውጭ ከ4-6 ሳምንታት ማስቀመጥ ይችላሉ፤ ነገር ግን ከ4-6 ሳምንታት በኋላ ጥቅም ላይ ካልዋለ ይጣሉት። 
-	የተከፈቱ የኢንሱሊን ጠርሙሶችን ከሙቀት፣ ከፀሐይ ብርሃን ይከላከሉ`
        },
        {
          id: 6,
          name: "Metformin",
          amharic_name: `ሜትፎርሚን`,
          usage: `-	ከፍተኛ የደም ስኳር (የስኳር ህመም) ለማከም ያገለግላል
-	ከሆርሞን መዛባት ጋር ተያይዞ ለሚከሰት ህመም ለማከም ጥቅም ላይ ሊውል ይችላል`,
          before_taking: `-	ለዚህ መድሃኒት ወይም ለሌላ መድሃኒት፣ ለምግብ ወይም ሌሎች ነገሮች አለርጂ ካለብዎ ወይም የሚከተሉትን ምልክቶች ካዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት፤ ወይም ሌላ ማንኛውም ምልክቶች
-	ከእነዚህ የጤና ችግሮች ውስጥ አንዳቸውም ካጋጠመዎት፡- የኩላሊት ህመም ወይም የጉበት ህመም ፣ ከመጠን በላይ አልኮል የሚጠጡ ከሆነ፣ የፈሳሽ እጥረት፣ የደም አሲድ ችግር
-	ራጅ፣ ሲቲ ስካን፣ ኤም አር አይ የመሳሰሉትን በኮንትራስት ሚዲያ የሚነሱ ከሆነ`,
          while_taking: `-	የሚወስዱትን ሁሉንም መድሃኒቶች ዝርዝር (ያለሐኪም ትዕዛዝ የሚወሰዱትንም) ለሐኪምዎ ያሳውቁ
-	ይህ መድሃኒት አይለቅብዎ
-	ቀዶ ጥገና እያደረጉ ከሆነ፣ የልብ ድካም፣ ከባድ ኢንፌክሽን ወይም ስትሮክ ካለብዎ ወይም 80 ዓመት ወይም ከዚያ በላይ ከሆናችሁ እና የኩላሊት ስራዎ ያልተመረመረ ከሆነ መድሃኒቱን በተመለከተ ሐኪምዎን ያማክሩ (የታካሚውን ደህንነት ለመጠበቅ)
-	የሳንባ እና የልብ ሕመም ካለብዎ ሐኪምዎን ያነጋግሩ
-	በዶክተርዎ እንደተነገሩት የደምዎን ስኳር መጠን ይለኩ
-	የዓይን እና የእግር ምርመራ በሐኪምዎ ክትትል ያድርጉ 
-	የአልኮል መጠጦችን ከመጠጣት ይገደቡ
-	የደምዎ ስኳር መጠን ዝቅተኛ ከሆነ መኪና አያሽከርክሩ
-	እርጉዝ ከሆኑ ወይም ለማርገዝ ካሰቡ ለሐኪምዎ ይንገሩ
-	ጡት እያጠቡ ከሆነ ለሐኪምዎ ይንገሩ`,
          side_effects: `-	ዝቅተኛ የደም ስኳር ሊከሰት ይችላል፤ ምልክቶቹ ማዞር፣ ራስ ምታት፣ የእንቅልፍ ስሜት፣ የድካም ስሜት፣ መንቀጥቀጥ፣ ፈጣን የልብ ምት፣ ረሃብ፣ ላብ ግራ፣ ራስን መሳት ሊሆኑ ይችላሉ። ለዚህም ከረሜላዎችን፣ ጭማቂ፣ ከተገኘ የግሉኮስ እንክብል ወይም ፈሳሽ በእጅዎ ይያዙ።
-	�የሆድ ህመም፣ የምግብ ፍላጎት መቀነስ (አለመራብ) ወይም የሆድ መንፋት 
-	የምግብ አለመርጋት። ለዚህም ትንሽ ትንሽ  በተደጋጋሚ መመገብ፣ ጥሩ የአፍ እንክብካቤ፣ ከስኳር ነፃ የሆነ ከረሜላ ወይም ከስኳር ነፃ የሆነ ማስቲካ ማኘክ ሊረዳ ይችላል።
-	ተቅማጥ
-	በአፍዎ ውስጥ መጥፎ ጣዕም፤ ይህ ብዙውን ጊዜ የሚስተካከል ነው።
-	በጣም ጥቂት ሰዎች ላይ በደም ውስጥ የአሲድ መብዛት (ላክቲክ አሲዶሲስ) ሊከሰት ይችላል።`,
          serious_side_effects: `-	ከታዘዘው መጠን በላይ እንደወሰዱ ካሰቡ 
-	የአለርጂ ምልክቶች ከታዩ እንደ ሽፍታ፤ ማሳከክ፤ የትንፋሽ እጥረት፤ ሳል፤ የፊት፣ የከንፈር፣ የምላስ ወይም የጉሮሮ እብጠት የመሳሰሉት 
-	በጣም ዝቅተኛ የደም ስኳር መጠን ወይም በጣም ከፍተኛ �የደም ስኳር መጠን
-	ከባድ የማዞር ስሜት
-	የመተንፈስ ችግር
-	የቅዝቃዜ ስሜት
-	በጣም ከባድ የሆድ ህመም ወይም ትውከት (ተቅማጥ)
-	ከፍተኛ የክብደት መቀነስ
-	ከፍተኛ የጡንቻ ሕመም ወይም መዛል
-	ከፍተኛ የድካም ስሜት 
-	ማንኛውም ሽፍታ`,
          how_to_take: `-	ምንም እንኳን ጥሩ ስሜት ቢሰማዎትም በተነገርዎ መጠን ይውሰዱ
-	በእንክብል መልክ የተዘጋጀና በአፍ የሚዋጥ 
-	ከምግብ ጋር ወይም ያለ ምግብ መውሰድ ይችላሉ፤ የጨጓራ ህመም የሚያስከትል ከሆነ ከምግብ ጋር ይውሰዱ።
-	ከአንድ ብርጭቆ ሙሉ ውሃ ጋር ይውሰዱ
-	ሐኪምዎ የነገረዎትን የአመጋገብ እና የአካል ብቃት እንቅስቃሴ እቅድ በመከተል`,
          missed_dose: `-	ልክ እንዳስታወሱ ያለፈዎትን መጠን ይውሰዱ፤ ነገር ግን ቀጣዩን የሚወስዱበት ጊዜ ከተቃረበ ያለፈዎትን ይዝለሉ እና ወደ መደበኛው የሚወስዱበት ጊዜዎ ይመለሱ።
-	በተመሳሳይ ጊዜ 2 መጠን ወይም ተጨማሪ መጠን አይወስዱ
-	መጠኑን አይቀይሩ ወይም ይህን መድሃኒት አያቁሙ፤ ሐኪምዎን ያማክሩ`,
          storage: `-	እንክብሉን በደረቅ ቦታ (~25°C) ያስቀምጡ፤ እርጥበታማ ቦታ አያስቀምጡ።`
        }
      ];

      setMedicationData(sampleMedications);
      setFilteredMedications(sampleMedications);
    } catch (err) {
      setError("Error fetching medications: " + err.message);
    }
  };

  const fetchHomeRemedies = async () => {
    try {
      // Sample HomeRemedies data (keys lowercased to match UI)
      const sampleHomeRemedies = [
        {
          id: 1,
          name: "Anemia",
          amharic_name: `ደም ማነስ`,
          home_remedies: `-	በአይረን የበለፀጉ ምግቦች እንደ ስስ ስጋ፣ አሳ፣ ምስር፣ ሽምብራ፣ ቶፉ እና ጥቁር ቅጠላማ አትክልቶችን መመገብ
-	ሽፈራው (Moringa oleifera): በአይረን እና በቫይታሚን ሲ የበለፀገ በመሆኑ የአይረን መጠን እና የሄሞግሎቢን መጠንን ሊያሻሽል ይችላል
-	ጓያ (Lathyrus sativus)፣ ቀይ ጤፍ (Erogratis abyssinicus)፣Eleusine coracana (ዳጉሳ)፣ ምስር (Lens culinaris)፣ አኩሪ አተር (Glycine max): እነዚህ ምግቦች በብረት የበለፀጉ ናቸው። በመደበኛ ምግቦችዎ ውስጥ በማካተት ይመገቧቸው።
- ወይን፣ ዘቢብ (Vitis vinifera): አንድ የሻይ ማንኪያ የደረቀ ወይን በሁለት ብርጭቆ ውሃ ቀቅሉ። ካጠለሉ በኋላ ስኳር ወይም ማር ጨምረው በየቀኑ ለአንድ ሳምንት ይጠጡ።
- የከብት ጉበት: እንደወደዱት አብስለው ይመገቡ።
- ገብስ (Hordeum vulgare): ገብሱን ጠብሰው ትንሽ ደምስሰው ከጣዕም ሰጪ ነገር ጋር እንደ ሻይ አፍልተው ይጠጡ።
- ጥቁር ሰናፍጭ (Brassica nigra): አረንጓዴ ቅጠሉ በቫይታሚኖች እና በማዕድናት የበለፀገ ነው። ቅጠሉን ከማር ጋር በመቀላቀል ይመገቡ። 
- ቶጋ (Justicia diclipteroides): ቅጠሉን በውሃ ቀቅለው፣ ስኳር ጨምረው ይጠጡ።`,
          medical_advise: `- ለትክክለኛ ምርመራ እና ሕክምና የጤና ባለሙያን መማከር አስፈላጊ ነው።`
        },
        {
          id: 2,
          name: "Constipation",
          amharic_name: `የሆድ ድርቀት`,
          home_remedies: `-	ተልባ ዘር፣ ቺያ ዘር እና ማር: አንድ የሻይ ማንኪያ ተልባና ቺያ ዘር በ1 ኩባያ የሞቀ ውሃ ውስጥ ለ15 ደቂቃ ካጠለሉ በኋላ አንድ የሻይ ማንኪያ ማር ይቀላቅሉ። በደንብ ካዋሃዱ በኋላ ከመተኛት በፊት ይጠጡ።
- ጤና አዳም፡- ሙሉ ተክሉን በነጭ ሽንኩርት ቀቅለው፣ በተፈጥሮ ማር እንዲጣፍጥ የተደረገውን መረቅ በአንድ ጊዜ መውሰድ።`,
          medical_advise: `- ከሦስት ሳምንታት በላይ የሚቆይ ወይም ከሸለላ ኣንጀት ደም መፍሰስ ጋር አብሮ ያለ፣ ያልተጠበቀ የክብደት መቀነስ፣ ወይም ከፍተኛ የሆድ ህመም፣ ይህም እንደ የአንጀት መዘጋት ወይም የአንጀት ካንሰር ያሉ ይበልጥ ከባድ የሆኑ መሰረታዊ ሁኔታዎችን ሊያመለክት ይችላል።
- ፈሳሽና አካላዊ እንቅስቃሴን መጨመር።`
        }
      ];

      setHomeRemediesData(sampleHomeRemedies);
      setFilteredHomeRemedies(sampleHomeRemedies);
    } catch (err) {
      setError("Error fetching homeRemedies: " + err.message);
    }
  };

  const fetchMinorIllness = async () => {
    try {
      // Sample MinorIllness data (keys lowercased to match UI)
      const sampleMinorIllness = [
        {
          id: 1,
          name: "Cough",
          amharic_name: `ሳል`,
          presentation: `- ደረቅ ሳል ወይም አክታ ...`,
          folk_medicine: `- ማር ይውሰዱ`,
          otc_drug: `- ፋርማሲስት በማማከር ...`,
          for_pharmacists: `- Use OTC drugs like dextromethorphan ...`
        },
        {
          id: 2,
          name: "Constipation",
          amharic_name: `የሆድ ድርቀት`,
          presentation: `- ሆድ መንፋት  ...`,
          folk_medicine: `- `,
          otc_drug: `- ፋርማሲስት በማማከር ...`,
          for_pharmacists: `- Use OTC drugs like  ...`
        }
      ];

      setMinorIllnessData(sampleMinorIllness);
      setFilteredMinorIllness(sampleMinorIllness);
    } catch (err) {
      setError("Error fetching minorIllness: " + err.message);
    }
  };

  const fetchExtemporaneousPreparation = async () => {
    try {
      // Sample ExtemporaneousPreparation data (keys lowercased)
      const sampleExtemporaneousPreparation = [
        {
          id: 1,
          name: "Lugols Solution",
          use: `- For thyroid patients`,
          formula: `- -------`,
          materials: `-------`,
          preparation: `-------`,
          label: `- -------`
        },
        {
          id: 2,
          name: "Capecitabine Oral Suspension",
          use: `- For cancer patients`,
          formula: `- -------`,
          materials: `-  Capecitabine tablets: two 500 mg or five 200 mg tablets. 
- Vehicle: Ora-Plus / Ora-Sweet
- mortar & pestle, graduated cylinder, amber bottle, balance`,
          preparation: `- tablets are film-coate; crushing required for suspension
- strict containement and PPE
- count tablets needed. Crush tablets finely in a mortar to a free-flowing powder
- triturate powder with a small volume of Ora-Plus to form a smooth paste. Cntinue adding Ora-Plus until well dispersed. Add Ora-Sweet to reach final volume. Mix thoroughly.
- transfer to amber bottle.`,
          label: `- Hazardous-cytotoxic`
        }
      ];

      setExtemporaneousPreparationData(sampleExtemporaneousPreparation);
      setFilteredExtemporaneousPreparation(sampleExtemporaneousPreparation);
    } catch (err) {
      setError("Error fetching extemporaneouspreparation: " + err.message);
    }
  };

  const fetchAllPatientCodes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated!");
      }

      const { data, error } = await supabase
        .from("patients")
        .select("patient_code, created_at")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setAllPatientCodes(data || []);
      setFilteredPatientCodes(data || []);
    } catch (err) {
      setError("Error fetching patient codes: " + err.message);
    }
  }, []);

  // Filter patient codes based on search input in the main search box
  useEffect(() => {
    if (patientCode.trim() === "") {
      setFilteredPatientCodes(allPatientCodes);
    } else {
      const filtered = allPatientCodes.filter(patient =>
        patient.patient_code.toLowerCase().includes(patientCode.toLowerCase())
      );
      setFilteredPatientCodes(filtered);
    }
  }, [patientCode, allPatientCodes]);

  // Filter links based on search input
  useEffect(() => {
    if (searchLink.trim() === "") {
      setFilteredLinks(resourceLinks);
    } else {
      const filtered = resourceLinks.filter(link =>
        link.name.toLowerCase().includes(searchLink.toLowerCase()) ||
        (link.url && link.url.toLowerCase().includes(searchLink.toLowerCase()))
      );
      setFilteredLinks(filtered);
    }
  }, [searchLink, resourceLinks]);

  // Filter medications based on search input
  useEffect(() => {
    if (searchMedication.trim() === "") {
      setFilteredMedications(medicationData);
    } else {
      const filtered = medicationData.filter(med =>
        med.name.toLowerCase().includes(searchMedication.toLowerCase()) ||
        (med.amharic_name && med.amharic_name.toLowerCase().includes(searchMedication.toLowerCase()))
      );
      setFilteredMedications(filtered);
    }
  }, [searchMedication, medicationData]);

  // Filter HomeRemedies based on search input (fixed variable names)
  useEffect(() => {
    if (searchHomeRemedies.trim() === "") {
      setFilteredHomeRemedies(homeRemediesData);
    } else {
      const filtered = homeRemediesData.filter(item =>
        item.name.toLowerCase().includes(searchHomeRemedies.toLowerCase()) ||
        (item.amharic_name && item.amharic_name.toLowerCase().includes(searchHomeRemedies.toLowerCase()))
      );
      setFilteredHomeRemedies(filtered);
    }
  }, [searchHomeRemedies, homeRemediesData]);
  
  // Filter MinorIllness based on search input (fixed variable names)
  useEffect(() => {
    if (searchMinorIllness.trim() === "") {
      setFilteredMinorIllness(minorIllnessData);
    } else {
      const filtered = minorIllnessData.filter(minor =>
        minor.name.toLowerCase().includes(searchMinorIllness.toLowerCase()) ||
        (minor.amharic_name && minor.amharic_name.toLowerCase().includes(searchMinorIllness.toLowerCase()))
      );
      setFilteredMinorIllness(filtered);
    }
  }, [searchMinorIllness, minorIllnessData]);

  // Filter extemporaneouspreparation based on search input (fixed variable names)
  useEffect(() => {
    if (searchExtemporaneousPreparation.trim() === "") {
      setFilteredExtemporaneousPreparation(extemporaneousPreparationData);
    } else {
      const filtered = extemporaneousPreparationData.filter(item =>
        item.name.toLowerCase().includes(searchExtemporaneousPreparation.toLowerCase()) ||
        (item.use && item.use.toLowerCase().includes(searchExtemporaneousPreparation.toLowerCase()))
      );
      setFilteredExtemporaneousPreparation(filtered);
    }
  }, [searchExtemporaneousPreparation, extemporaneousPreparationData]);

  // Filter Medication Availability based on search input
  useEffect(() => {
    if (searchMedicationAvailability.trim() === "") {
      setFilteredMedicationAvailability(medicationAvailabilityData);
    } else {
      const filtered = medicationAvailabilityData.filter(item =>
        item.medication_name.toLowerCase().includes(searchMedicationAvailability.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchMedicationAvailability.toLowerCase()))
      );
      setFilteredMedicationAvailability(filtered);
    }
  }, [searchMedicationAvailability, medicationAvailabilityData]);

  // Consolidated effect to prevent copy / print and disable text selection while any modal is open
  useEffect(() => {
    const handleCopy = (e) => {
      if (showMedicationModal || showMinorIllnessModal || showExtemporaneousPreparationModal || showMedicationAvailabilityModal) {
        e.preventDefault();
        alert("Copying information is not allowed.");
      }
    };

    const handleBeforePrint = (e) => {
      if (showMedicationModal || showMinorIllnessModal || showExtemporaneousPreparationModal || showMedicationAvailabilityModal) {
        e.preventDefault();
        alert("Printing information is not allowed.");
      }
    };

    if (showMedicationModal || showMinorIllnessModal || showExtemporaneousPreparationModal || showMedicationAvailabilityModal) {
      document.addEventListener('copy', handleCopy);
      document.addEventListener('beforeprint', handleBeforePrint);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('beforeprint', handleBeforePrint);
      document.body.style.userSelect = '';
    };
  }, [showMedicationModal, showMinorIllnessModal, showExtemporaneousPreparationModal, showMedicationAvailabilityModal]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      setError("Error during logout: " + err.message);
    }
  };

  const validatePatientCode = (code) => /^[0-9]{4}[@#$%^&*!][a-z]$/.test(code);

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) {
        throw new Error(error.message);
      }

      alert("Appointment deleted successfully!");
      // Refresh appointments by searching again
      if (foundPatient) {
        handleSearch();
      }
    } catch (err) {
      setError("Error deleting appointment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!validatePatientCode(patientCode)) {
      setError("Invalid patient code! Must be 4 numbers, 1 symbol, and 1 lowercase letter.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated!");
      }

      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("patient_code", patientCode)
        .eq("created_by", user.id);

      if (error) {
        throw new Error(error.message);
      }

      alert("Patient deleted successfully!");
      // Reset all patient-related states
      setPatientCode("");
      setAppointmentDate("");
      setFoundPatient(null);
      setAppointments([]);
      setDiagnosis("");
      setLabData("");
      setImagingResults("");
      setShowPatientDetails(false);
      setShowMedicationHistory(false);
      setShowDrnAssessment(false);
      setShowPhAssistPlan(false);
      setShowPatientOutcome(false);
      setShowCostSection(false);

      // Refresh patient list
      fetchAllPatientCodes();
    } catch (err) {
      setError("Error deleting patient: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    if (!validatePatientCode(patientCode)) {
      setError("Invalid patient code! Must be 4 numbers, 1 symbol, and 1 lowercase letter.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated!");
      }

      const { data: existingPatient, error: checkError } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_code", patientCode)
        .eq("created_by", user.id)
        .maybeSingle();

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (existingPatient) {
        throw new Error("Patient code already exists!");
      }

      const newPatient = {
        patient_code: patientCode,
        diagnosis: diagnosis || "No data",
        pertinent_lab_data: labData || "No data",
        pertinent_imaging_results: imagingResults || "No data",
        appointment_date: appointmentDate || null,
        created_by: user.id,
      };

      const { error } = await supabase.from("patients").insert([newPatient]);

      if (error) {
        throw new Error(error.message);
      }

      alert("Patient added successfully!");
      setPatientCode("");
      setAppointmentDate("");
      setDiagnosis("");
      setLabData("");
      setImagingResults("");
      fetchAllPatientCodes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("appointment_date", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      setError("Error fetching appointments: " + err.message);
      return [];
    }
  };

  const handleSearch = useCallback(async () => {
    if (!validatePatientCode(patientCode)) {
      setError("Invalid patient code! Must be 4 numbers, 1 symbol, and 1 lowercase letter.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated!");
      }

      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_code, appointment_date, diagnosis, pertinent_lab_data, pertinent_imaging_results, created_at")
        .eq("patient_code", patientCode)
        .eq("created_by", user.id);

      if (error) {
        throw new Error(error.message);
      }

      if (data.length === 0) {
        setFoundPatient(null);
        setAppointments([]);
        setAppointmentDate("");
        setError("Patient not found.");
      } else {
        const patientData = data[0];
        setFoundPatient(patientData);

        // Fetch appointments for this patient
        const patientAppointments = await fetchAppointments(patientData.id);
        setAppointments(patientAppointments);

        setDiagnosis(patientData.diagnosis || "");
        setLabData(patientData.pertinent_lab_data || "");
        setImagingResults(patientData.pertinent_imaging_results || "");
        setAppointmentDate(patientData.appointment_date || "");
        setError("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientCode]);

  const handleAddAppointment = async (patientDetails) => {
    if (!foundPatient) {
      setError("No patient selected.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create a new appointment
      const newAppointment = {
        patient_id: foundPatient.id,
        appointment_date: appointmentDate || new Date().toISOString(),
        diagnosis: patientDetails.diagnosis,
        pertinent_lab_data: patientDetails.labData,
        pertinent_imaging_results: patientDetails.imagingResults,
        created_by: user.id
      };

      const { error } = await supabase
        .from("appointments")
        .insert([newAppointment]);

      if (error) {
        throw new Error(error.message);
      }

      alert("Appointment saved successfully!");

      // Refresh appointments
      const updatedAppointments = await fetchAppointments(foundPatient.id);
      setAppointments(updatedAppointments);

      setDiagnosis("");
      setLabData("");
      setImagingResults("");
      setAppointmentDate("");
    } catch (err) {
      setError("Error saving appointment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPatientSections = () => {
    setShowPatientDetails(false);
    setShowMedicationHistory(false);
    setShowDrnAssessment(false);
    setShowPhAssistPlan(false);
    setShowPatientOutcome(false);
    setShowCostSection(false);
  };

  const handleMedicationClick = (medication) => {
    setSelectedMedication(medication);
    setShowMedicationModal(true);
  };

  const handleHomeRemediesClick = (homeremedies) => {
    setSelectedHomeRemedies(homeremedies);
    setShowHomeRemediesModal(true);
  };

  const handleMinorIllnessClick = (minorillness) => {
    setSelectedMinorIllness(minorillness);
    setShowMinorIllnessModal(true);
  };

  const handleExtemporaneousPreparationClick = (extemporaneouspreparation) => {
    setSelectedExtemporaneousPreparation(extemporaneouspreparation);
    setShowExtemporaneousPreparationModal(true);
  };

  // Handle Medication Availability Click - similar to minor illness
  const handleMedicationAvailabilityClick = (availability) => {
    setSelectedMedicationAvailability(availability);
    setShowMedicationAvailabilityModal(true);
  };

  // Handle Add New Medication Post
  const handleAddMedicationPost = async () => {
    if (!newMedicationPost.medication_name.trim()) {
      setError("Please enter a medication name");
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would save to Supabase here
      // For now, we'll just add to the local state
      const newPost = {
        id: medicationAvailabilityData.length + 1,
        ...newMedicationPost,
        posted_by: user?.email || "Current User",
        posted_date: new Date().toISOString().split('T')[0],
        replies: []
      };

      setMedicationAvailabilityData(prev => [newPost, ...prev]);
      setFilteredMedicationAvailability(prev => [newPost, ...prev]);
      
      setNewMedicationPost({
        medication_name: "",
        location: "",
        details: "",
        contact: "",
        availability_status: "available"
      });
      
      alert("Medication availability posted successfully!");
    } catch (err) {
      setError("Error posting medication availability: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Reply to Medication Post
  const handleAddReply = async (postId) => {
    if (!replyText.trim()) {
      setError("Please enter a reply");
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would save to Supabase here
      // For now, we'll just update the local state
      const updatedData = medicationAvailabilityData.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            replies: [
              ...post.replies,
              {
                id: post.replies.length + 1,
                reply_text: replyText,
                replied_by: user?.email || "Current User",
                reply_date: new Date().toISOString().split('T')[0]
              }
            ]
          };
        }
        return post;
      });

      setMedicationAvailabilityData(updatedData);
      setFilteredMedicationAvailability(updatedData);
      setReplyText("");
      setReplyingToPostId(null);
      alert("Reply posted successfully!");
    } catch (err) {
      setError("Error posting reply: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle content visibility
  const toggleContent = (id) => {
    const content = document.getElementById(id);
    if (content) {
      content.classList.toggle('hidden');
    }
  };

  // Format medication content with proper line breaks for bullet points
  const formatMedicationContent = (content) => {
    if (!content) return "No information available";

    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex mb-1">
            <span className="font-bold mr-2">•</span>
            <span className="flex-1">{line.substring(1).trim()}</span>
          </div>
        );
      }
      return <div key={index} className="mb-1">{line}</div>;
    });
  };

  // Format homeremedies content with proper line breaks for bullet points
  const formatHomeRemediesContent = (content) => {
    if (!content) return "No information available";

    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex mb-1">
            <span className="font-bold mr-2">•</span>
            <span className="flex-1">{line.substring(1).trim()}</span>
          </div>
        );
      }
      return <div key={index} className="mb-1">{line}</div>;
    });
  };
  
  // Format minorillness content with proper line breaks for bullet points
  const formatMinorIllnessContent = (content) => {
    if (!content) return "No information available";

    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex mb-1">
            <span className="font-bold mr-2">•</span>
            <span className="flex-1">{line.substring(1).trim()}</span>
          </div>
        );
      }
      return <div key={index} className="mb-1">{line}</div>;
    });
  };

  // Format extemporaneouspreparation content with proper line breaks for bullet points
  const formatExtemporaneousPreparationContent = (content) => {
    if (!content) return "No information available";

    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex mb-1">
            <span className="font-bold mr-2">•</span>
            <span className="flex-1">{line.substring(1).trim()}</span>
          </div>
        );
      }
      return <div key={index} className="mb-1">{line}</div>;
    });
  };

  // Format medication availability content
  const formatMedicationAvailabilityContent = (content) => {
    if (!content) return "No information available";

    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex mb-1">
            <span className="font-bold mr-2">•</span>
            <span className="flex-1">{line.substring(1).trim()}</span>
          </div>
        );
      }
      return <div key={index} className="mb-1">{line}</div>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-indigo-600 shadow-lg py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => setShowComprehensiveMedicationManagement(!showComprehensiveMedicationManagement)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl py-3 px-5 rounded-lg mr-4 flex items-center"
          >
            Comprehensive Medication Management {showComprehensiveMedicationManagement ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
        </div>

        <h2 className="text-lg font-bold text-white tracking-wide">Welcome, {user?.email}</h2>

        <div className="flex items-center">
          <button
            onClick={() => setShowUsefulLinks(!showUsefulLinks)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl py-3 px-5 rounded-lg ml-4 flex items-center"
          >
            Useful Links {showUsefulLinks ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
          <button
            onClick={() => setShowMedicationInformation(!showMedicationInformation)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl py-3 px-5 rounded-lg ml-4 flex items-center"
          >
            የመድሃኒት መረጃ {showMedicationInformation ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
          <button
            onClick={() => setShowHomeRemedies(!showHomeRemedies)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl py-3 px-5 rounded-lg ml-4 flex items-center"
          >
            Home Remedies {showHomeRemedies ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
          <button
            onClick={() => setShowMinorIllness(!showMinorIllness)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl py-3 px-5 rounded-lg ml-4 flex items-center"
          >
            Minor Illnesses {showMinorIllness ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
          <button
            onClick={() => setShowExtemporaneousPreparation(!showExtemporaneousPreparation)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl py-3 px-5 rounded-lg ml-4 flex items-center"
          >
            Extemporaneous Preparation {showExtemporaneousPreparation ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
          {/* New Medication Availability Button */}
          <button
            onClick={() => setShowMedicationAvailability(!showMedicationAvailability)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl py-3 px-5 rounded-lg ml-4 flex items-center"
          >
            Medication Availability {showMedicationAvailability ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
          <button
            onClick={handleLogout}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-5 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 ml-4"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Error Display - Text only without box */}
      {error && (
        <div className="px-6 pt-4 text-red-600 text-center">
          {error}
          <button
            className="ml-2 text-red-700 hover:text-red-900"
            onClick={() => setError("")}
          >
            <FaTimes className="inline" />
          </button>
        </div>
      )}

      <div className="flex flex-col items-center justify-center flex-grow px-6 py-10">
        {/* Container for all three sections */}
        <div className={`w-full flex flex-col md:flex-row gap-6 justify-center ${(showComprehensiveMedicationManagement && showUsefulLinks && showMedicationInformation) ? 'md:flex-row' : 'md:flex-col'}`}>

      
          {/* Comprehensive Medication Management Section */}
          {showComprehensiveMedicationManagement && (
            <div className="w-full md:w-1/3 max-w-2xl bg-white rounded-2xl shadow-xl border-4 border-indigo-500 overflow-visible mb-6 h-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">CMM (MTM) Database</h3>

                <div className="relative mb-4">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={patientCode}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPatientCode(value);

                        // Show dropdown when typing
                        if (value.length > 0) {
                          setShowPatientCodesDropdown(true);

                          // Filter patient codes based on input
                          const filtered = allPatientCodes.filter(patient =>
                            patient.patient_code.toLowerCase().includes(value.toLowerCase())
                          );
                          setFilteredPatientCodes(filtered);
                        } else {
                          setShowPatientCodesDropdown(false);
                          setFilteredPatientCodes(allPatientCodes);
                        }

                        // Reset patient data when code changes
                        if (foundPatient) {
                          setFoundPatient(null);
                          setAppointments([]);
                          resetPatientSections();
                        }
                      }}
                      placeholder="Enter or search patient code"
                      className="border-2 p-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 shadow-sm pr-10"
                    />
                    <button
                      onClick={() => setShowPatientCodesDropdown(!showPatientCodesDropdown)}
                      className="ml-2 p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md"
                    >
                      {showPatientCodesDropdown ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </button>
                  </div>

                  {showPatientCodesDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredPatientCodes.length > 0 ? (
                        <ul className="py-1">
                          {filteredPatientCodes.map((patient, index) => (
                            <li
                              key={index}
                              className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
                              onClick={() => {
                                setPatientCode(patient.patient_code);
                                setShowPatientCodesDropdown(false);
                              }}
                            >
                              {patient.patient_code} - {new Date(patient.created_at).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No patient codes found</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-indigo-500 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaSearch /> {loading ? "Searching..." : "Search"}
                  </button>
                  <button
                    onClick={handleAddPatient}
                    disabled={loading}
                    className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaPlus /> Add
                  </button>
                  <button
                    onClick={handleDeletePatient}
                    disabled={loading || !foundPatient}
                    className="bg-red-500 hover:bg-red-700 disabled:bg-red-300 text-white py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>Total patients: {allPatientCodes.length}</p>
                  <p>Format: 4 numbers + 1 symbol + 1 lowercase letter (e.g., 1234@a)</p>
                </div>
              </div>
            </div>
          )}

          {/* Useful Links Section */}
          {showUsefulLinks && (
            <div className="w-full md:w-1/3 max-w-2xl bg-white rounded-2xl shadow-xl border-4 border-indigo-500 overflow-visible mb-6 h-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Useful Links</h3>

                <div className="mt-4">
                  <input
                    type="text"
                    value={searchLink}
                    onChange={(e) => setSearchLink(e.target.value)}
                    placeholder="Search links..."
                    className="border-2 p-2 rounded-lg w-full mb-3 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />

                  <div className="max-h-40 overflow-y-auto">
                    {filteredLinks.length > 0 ? (
                      <ul className="space-y-2">
                        {filteredLinks.map((link, index) => (
                          <li key={index}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-sm font-medium block p-1 hover:bg-gray-100 rounded"
                            >
                              {link.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No links found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medication Information Section */}
          {showMedicationInformation && (
            <div className="w-full md:w-1/3 max-w-2xl bg-white rounded-2xl shadow-xl border-4 border-indigo-500 overflow-visible mb-6 h-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">የመድሃኒት መረጃ</h3>

                <div className="mt-4">
                  <input
                    type="text"
                    value={searchMedication}
                    onChange={(e) => setSearchMedication(e.target.value)}
                    placeholder="Search medications..."
                    className="border-2 p-2 rounded-lg w-full mb-3 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />

                  <div className="max-h-40 overflow-y-auto">
                    {filteredMedications.length > 0 ? (
                      <ul className="space-y-2">
                        {filteredMedications.map((medication, index) => (
                          <li key={index}>
                            <button
                              onClick={() => handleMedicationClick(medication)}
                              className="text-blue-500 hover:text-blue-700 text-sm font-medium block p-1 hover:bg-gray-100 rounded w-full text-left"
                            >
                              {medication.name} {medication.amharic_name && `(${medication.amharic_name})`}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No medications found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medication Availability Section - Similar to Minor Illnesses */}
          {showMedicationAvailability && (
            <div className="w-full md:w-1/3 max-w-2xl bg-white rounded-2xl shadow-xl border-4 border-indigo-500 overflow-visible mb-6 h-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Medication Availability</h3>

                <div className="mt-4">
                  <input
                    type="text"
                    value={searchMedicationAvailability}
                    onChange={(e) => setSearchMedicationAvailability(e.target.value)}
                    placeholder="Search medication availability..."
                    className="border-2 p-2 rounded-lg w-full mb-3 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />

                  <div className="max-h-40 overflow-y-auto">
                    {filteredMedicationAvailability.length > 0 ? (
                      <ul className="space-y-2">
                        {filteredMedicationAvailability.map((availability, index) => (
                          <li key={index}>
                            <div
                              onClick={() => handleMedicationAvailabilityClick(availability)}
                              className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm font-medium block p-1 hover:bg-gray-100 rounded"
                            >
                              {availability.medication_name} 
                              {availability.location && ` - ${availability.location}`}
                              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                availability.availability_status === 'available' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {availability.availability_status}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No medication availability posts found</p>
                    )}
                  </div>
                </div>

                {/* New Post Form */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Post Medication Availability</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newMedicationPost.medication_name}
                      onChange={(e) => setNewMedicationPost({...newMedicationPost, medication_name: e.target.value})}
                      placeholder="Medication name *"
                      className="border p-2 rounded w-full text-sm"
                    />
                    <input
                      type="text"
                      value={newMedicationPost.location}
                      onChange={(e) => setNewMedicationPost({...newMedicationPost, location: e.target.value})}
                      placeholder="Location"
                      className="border p-2 rounded w-full text-sm"
                    />
                    <textarea
                      value={newMedicationPost.details}
                      onChange={(e) => setNewMedicationPost({...newMedicationPost, details: e.target.value})}
                      placeholder="Details"
                      rows="2"
                      className="border p-2 rounded w-full text-sm"
                   /> 
                    <input
                      type="text"
                      value={newMedicationPost.contact}
                      onChange={(e) => setNewMedicationPost({...newMedicationPost, contact: e.target.value})}
                      placeholder="Contact"
                      className="border p-2 rounded w-full text-sm" 
                    />
                    <select
                      value={newMedicationPost.availability_status}
                      onChange={(e) => setNewMedicationPost({...newMedicationPost, availability_status: e.target.value})}
                      className="border p-2 rounded w-full text-sm"
                    >
                      <option value="available">Available</option>
                      <option value="needed">Needed</option>
                    </select>
                    <button
                      onClick={handleAddMedicationPost}
                      disabled={loading || !newMedicationPost.medication_name.trim()}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded text-sm"
                    >
                      {loading ? "Posting..." : "Post Availability"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Medication Information Modal */}
        {showMedicationModal && selectedMedication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedMedication.name}
                  {selectedMedication.amharic_name && ` (${selectedMedication.amharic_name})`}
                </h3>
                <button
                  onClick={() => setShowMedicationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-4">
                {/* Usage Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('usage-content')}
                  >
                    <span>ይህ መድሃኒት ለምን ጥቅም ላይ ይውላል?</span>
                    <FaChevronDown />
                  </button>
                  <div id="usage-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMedicationContent(selectedMedication.usage)}
                    </div>
                  </div>
                </div>

                {/* Before Taking Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('before-taking-content')}
                  >
                    <span>ይህንን መድሃኒት ከመውሰዴ በፊት ለዶክተሬ ምን መንገር አለብኝ?</span>
                    <FaChevronDown />
                  </button>
                  <div id="before-taking-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMedicationContent(selectedMedication.before_taking)}
                    </div>
                  </div>
                </div>

                {/* While Taking Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('while-taking-content')}
                  >
                    <span>ይህን መድሃኒት በምወስድበት ጊዜ ማወቅ ወይም ማድረግ ያለብኝ አንዳንድ ነገሮች ምንድን ናቸው?</span>
                    <FaChevronDown />
                  </button>
                  <div id="while-taking-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMedicationContent(selectedMedication.while_taking)}
                    </div>
                  </div>
                </div>

                {/* Side Effects Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('side-effects-content')}
                  >
                    <span>የዚህ መድሃኒት አንድንድ የጎንዮሽ ጉዳቶች ምንድናቸው?</span>
                    <FaChevronDown />
                  </button>
                  <div id="side-effects-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMedicationContent(selectedMedication.side_effects)}
                    </div>
                  </div>
                </div>

                {/* Serious Side Effects Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('serious-side-effects-content')}
                  >
                    <span>ወዲያውኑ ለሐኪሜ ማሳወቅ ያለብኝ አንዳንድ የጎንዮሽ ጉዳቶች ምንድን ናቸው?</span>
                    <FaChevronDown />
                  </button>
                  <div id="serious-side-effects-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMedicationContent(selectedMedication.serious_side_effects)}
                    </div>
                  </div>
                </div>

                {/* How to Take Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('how-to-take-content')}
                  >
                    <span>ይህ መድሃኒት እንዴት ይወሰዳል?</span>
                    <FaChevronDown />
                  </button>
                  <div id="how-to-take-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMedicationContent(selectedMedication.how_to_take)}
                    </div>
                  </div>
                </div>

                {/* Missed Dose Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('missed-dose-content')}
                  >
                    <span>መድሃኒቱን ሳልወሰድ ሰዓቱ ካለፈ ምን ማድረግ አለብኝ?</span>
                    <FaChevronDown />
                  </button>
                  <div id="missed-dose-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMedicationContent(selectedMedication.missed_dose)}
                    </div>
                  </div>
                </div>

                {/* Storage Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('storage-content')}
                  >
                    <span>ይህንን መድሃኒት እንዴት ማስቀመጥ እችላለሁ?</span>
                    <FaChevronDown />
                  </button>
                  <div id="storage-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMedicationContent(selectedMedication.storage)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  This information is for educational purposes only. Always consult your healthcare provider.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Medication Availability Modal */}
        {showMedicationAvailabilityModal && selectedMedicationAvailability && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedMedicationAvailability.medication_name}
                  <span className={`ml-2 px-2 py-1 text-sm rounded ${
                    selectedMedicationAvailability.availability_status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedMedicationAvailability.availability_status}
                  </span>
                </h3>
                <button
                  onClick={() => setShowMedicationAvailabilityModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-4">
                {/* Medication Details Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('medication-details-content')}
                  >
                    <span>Medication Details</span>
                    <FaChevronDown />
                  </button>
                  <div id="medication-details-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="space-y-2">
                      <p><strong>Medication:</strong> {selectedMedicationAvailability.medication_name}</p>
                      {selectedMedicationAvailability.location && (
                        <p><strong>Location:</strong> {selectedMedicationAvailability.location}</p>
                      )}
                      {selectedMedicationAvailability.details && (
                        <p><strong>Details:</strong> {selectedMedicationAvailability.details}</p>
                      )}
                      {selectedMedicationAvailability.contact && (
                        <p><strong>Contact:</strong> {selectedMedicationAvailability.contact}</p>
                      )}
                      <p><strong>Status:</strong> 
                        <span className={`ml-1 px-2 py-1 text-xs rounded ${
                          selectedMedicationAvailability.availability_status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedMedicationAvailability.availability_status}
                        </span>
                      </p>
                      <p><strong>Posted by:</strong> {selectedMedicationAvailability.posted_by}</p>
                      <p><strong>Date:</strong> {selectedMedicationAvailability.posted_date}</p>
                    </div>
                  </div>
                </div>

                {/* Replies Section */}
                {selectedMedicationAvailability.replies && selectedMedicationAvailability.replies.length > 0 && (
                  <div className="mb-4">
                    <button
                      className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                      onClick={() => toggleContent('replies-content')}
                    >
                      <span>Replies ({selectedMedicationAvailability.replies.length})</span>
                      <FaChevronDown />
                    </button>
                    <div id="replies-content" className="hidden p-3 bg-gray-100 rounded">
                      <div className="space-y-3">
                        {selectedMedicationAvailability.replies.map((reply) => (
                          <div key={reply.id} className="border-l-4 border-indigo-300 pl-3 py-2">
                            <p className="text-gray-700">{reply.reply_text}</p>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="flex items-center">
                                <FaUser className="mr-1" />
                                {reply.replied_by} - {reply.reply_date}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Reply Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('add-reply-content')}
                  >
                    <span>Add Reply</span>
                    <FaChevronDown />
                  </button>
                  <div id="add-reply-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        rows="3"
                        className="border p-2 rounded w-full"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddReply(selectedMedicationAvailability.id)}
                          disabled={loading || !replyText.trim()}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded flex items-center gap-2"
                        >
                          <FaReply /> {loading ? "Posting..." : "Post Reply"}
                        </button>
                        {replyingToPostId === selectedMedicationAvailability.id && (
                          <button
                            onClick={() => {
                              setReplyText("");
                              setReplyingToPostId(null);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  Share medication availability information with other healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Home Remedies Section */}
        {showHomeRemedies && (
          <div className="w-full md:w-1/3 max-w-2xl bg-white rounded-2xl shadow-xl border-4 border-indigo-500 overflow-visible mb-6 h-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Home Remedies</h3>

              <div className="mt-4">
                <input
                  type="text"
                  value={searchHomeRemedies}
                  onChange={(e) => setSearchHomeRemedies(e.target.value)}
                  placeholder="Search HomeRemedies..."
                  className="border-2 p-2 rounded-lg w-full mb-3 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />

                <div className="max-h-40 overflow-y-auto">
                  {filteredHomeRemedies.length > 0 ? (
                    <ul className="space-y-2">
                      {filteredHomeRemedies.map((homeremedies, index) => (
                        <li key={index}>
                          <div
                            onClick={() => handleHomeRemediesClick(homeremedies)}
                            className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm font-medium block p-1 hover:bg-gray-100 rounded"
                          >
                            {homeremedies.name} {homeremedies.amharic_name && `(${homeremedies.amharic_name})`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No HomeRemedies found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Home Remedies Modal */}
        {showHomeRemediesModal && selectedHomeRemedies && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedHomeRemedies.name}
                  {selectedHomeRemedies.amharic_name && ` (${selectedHomeRemedies.amharic_name})`}
                </h3>
                <button
                  onClick={() => setShowHomeRemediesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-4">
                {/* home remedies Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('home-remedies-content')}
                  >
                    <span>home remedies</span>
                    <FaChevronDown />
                  </button>
                  <div id="home-remedies-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatHomeRemediesContent(selectedHomeRemedies.home_remedies)}
                    </div>
                  </div>
                </div>

                {/* medical advise Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('medical-advise-content')}
                  >
                    <span>medical advise</span>
                    <FaChevronDown />
                  </button>
                  <div id="medical-advise-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatHomeRemediesContent(selectedHomeRemedies.medical_advise)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  This information is for educational purposes only. Always consult your healthcare provider.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Minor Illnesses Section */}
        {showMinorIllness && (
          <div className="w-full md:w-1/3 max-w-2xl bg-white rounded-2xl shadow-xl border-4 border-indigo-500 overflow-visible mb-6 h-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Minor Illnesses</h3>

              <div className="mt-4">
                <input
                  type="text"
                  value={searchMinorIllness}
                  onChange={(e) => setSearchMinorIllness(e.target.value)}
                  placeholder="Search MinorIllness..."
                  className="border-2 p-2 rounded-lg w-full mb-3 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />

                <div className="max-h-40 overflow-y-auto">
                  {filteredMinorIllness.length > 0 ? (
                    <ul className="space-y-2">
                      {filteredMinorIllness.map((minorillness, index) => (
                        <li key={index}>
                          <div
                            onClick={() => handleMinorIllnessClick(minorillness)}
                            className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm font-medium block p-1 hover:bg-gray-100 rounded"
                          >
                            {minorillness.name} {minorillness.amharic_name && `(${minorillness.amharic_name})`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No MinorIllness found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minor Illness Modal */}
        {showMinorIllnessModal && selectedMinorIllness && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedMinorIllness.name}
                  {selectedMinorIllness.amharic_name && ` (${selectedMinorIllness.amharic_name})`}
                </h3>
                <button
                  onClick={() => setShowMinorIllnessModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-4">
                {/* Presentation Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('presentation-content')}
                  >
                    <span>Presentation</span>
                    <FaChevronDown />
                  </button>
                  <div id="presentation-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMinorIllnessContent(selectedMinorIllness.presentation)}
                    </div>
                  </div>
                </div>

                {/* Folk Medicine Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('folk-medicine-content')}
                  >
                    <span>Folk Medicine</span>
                    <FaChevronDown />
                  </button>
                  <div id="folk-medicine-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMinorIllnessContent(selectedMinorIllness.folk_medicine)}
                    </div>
                  </div>
                </div>

                {/* OTC Drug Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('otc-drug-content')}
                  >
                    <span>OTC Drug</span>
                    <FaChevronDown />
                  </button>
                  <div id="otc-drug-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMinorIllnessContent(selectedMinorIllness.otc_drug)}
                    </div>
                  </div>
                </div>

                {/* Guide For Pharmacists Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('for-pharmacists-content')}
                  >
                    <span>Guide For Pharmacists</span>
                    <FaChevronDown />
                  </button>
                  <div id="for-pharmacists-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatMinorIllnessContent(selectedMinorIllness.for_pharmacists)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  This information is for educational purposes only. Always consult your healthcare provider.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extemporaneous Preparation Section */}
        {showExtemporaneousPreparation && (
          <div className="w-full md:w-1/3 max-w-2xl bg-white rounded-2xl shadow-xl border-4 border-indigo-500 overflow-visible mb-6 h-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Extemporaneous Preparation</h3>

              <div className="mt-4">
                <input
                  type="text"
                  value={searchExtemporaneousPreparation}
                  onChange={(e) => setSearchExtemporaneousPreparation(e.target.value)}
                  placeholder="Search ExtemporaneousPreparation..."
                  className="border-2 p-2 rounded-lg w-full mb-3 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />

                <div className="max-h-40 overflow-y-auto">
                  {filteredExtemporaneousPreparation.length > 0 ? (
                    <ul className="space-y-2">
                      {filteredExtemporaneousPreparation.map((extemporaneouspreparation, index) => (
                        <li key={index}>
                          <div
                            onClick={() => handleExtemporaneousPreparationClick(extemporaneouspreparation)}
                            className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm font-medium block p-1 hover:bg-gray-100 rounded"
                          >
                            {extemporaneouspreparation.name} 
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No ExtemporaneousPreparation found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extemporaneous Preparation Modal */}
        {showExtemporaneousPreparationModal && selectedExtemporaneousPreparation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedExtemporaneousPreparation.name}
                </h3>
                <button
                  onClick={() => setShowExtemporaneousPreparationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-4">
                {/* Use Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('use-content')}
                  >
                    <span>Use</span>
                    <FaChevronDown />
                  </button>
                  <div id="use-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatExtemporaneousPreparationContent(selectedExtemporaneousPreparation.use)}
                    </div>
                  </div>
                </div>

                {/* Formula Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('formula-content')}
                  >
                    <span>Formula</span>
                    <FaChevronDown />
                  </button>
                  <div id="formula-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatExtemporaneousPreparationContent(selectedExtemporaneousPreparation.formula)}
                    </div>
                  </div>
                </div>

                {/* Materials Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('materials-content')}
                  >
                    <span>Materials</span>
                    <FaChevronDown />
                  </button>
                  <div id="materials-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatExtemporaneousPreparationContent(selectedExtemporaneousPreparation.materials)}
                    </div>
                  </div>
                </div>

                {/* Preparation Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('preparation-content')}
                  >
                    <span>Preparation</span>
                    <FaChevronDown />
                  </button>
                  <div id="preparation-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatExtemporaneousPreparationContent(selectedExtemporaneousPreparation.preparation)}
                    </div>
                  </div>
                </div>

                {/* Label Section */}
                <div className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left font-semibold text-lg text-indigo-700 mb-2 p-2 bg-indigo-50 rounded-md"
                    onClick={() => toggleContent('label-content')}
                  >
                    <span>Label</span>
                    <FaChevronDown />
                  </button>
                  <div id="label-content" className="hidden p-3 bg-gray-100 rounded">
                    <div className="text-gray-700 font-bold text-lg">
                      {formatExtemporaneousPreparationContent(selectedExtemporaneousPreparation.label)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  This information is for educational purposes only. Always consult your healthcare provider.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Patient Details & Buttons */}
        {foundPatient && (
          <div className="flex flex-wrap justify-center mt-6 gap-4">
            <button
              onClick={() => setShowPatientDetails((prev) => !prev)}
              className={`py-3 px-6 rounded-xl text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                showPatientDetails
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {showPatientDetails ? "Hide Patient Data" : "Patient Data"}
            </button>

            <button
              onClick={() => setShowMedicationHistory((prev) => !prev)}
              className={`py-3 px-6 rounded-xl text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                showMedicationHistory
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {showMedicationHistory ? "Hide Comprehensive Medication Hx" : "Comprehensive Medication Hx"}
            </button>

            <button
              onClick={() => setShowDrnAssessment((prev) => !prev)}
              className={`py-3 px-6 rounded-xl text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                showDrnAssessment
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {showDrnAssessment ? "Hide DRN Assessment" : "DRN Assessment"}
            </button>

            <button
              onClick={() => setShowPhAssistPlan((prev) => !prev)}
              className={`py-3 px-6 rounded-xl text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                showPhAssistPlan
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {showPhAssistPlan ? "Hide Pharmacy Asst & Plan" : "Pharmacy Assessment & Plan"}
            </button>

            <button
              onClick={() => setShowPatientOutcome((prev) => !prev)}
              className={`py-3 px-6 rounded-xl text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                showPatientOutcome
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {showPatientOutcome ? "Hide Patient Outcome" : "Patient Outcome"}
            </button>

            <button
              onClick={() => setShowCostSection((prev) => !prev)}
              className={`py-3 px-6 rounded-xl text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                showCostSection
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {showCostSection ? "Hide Cost Section" : "Cost Section"}
            </button>
          </div>
        )}

        {/* DRN Assessment Component */}
        {showDrnAssessment && <DrnAssessment patientCode={patientCode} />}
        {showPatientDetails && (
          <PatientDetails
            foundPatient={foundPatient}
            diagnosis={diagnosis}
            setDiagnosis={setDiagnosis}
            labData={labData}
            setLabData={setLabData}
            imagingResults={imagingResults}
            setImagingResults={setImagingResults}
            appointmentDate={appointmentDate}
            setAppointmentDate={setAppointmentDate}
            appointments={appointments}
            handleDeleteAppointment={handleDeleteAppointment}
            handleAddAppointment={handleAddAppointment}
            loading={loading}
          />
        )}
        {showMedicationHistory && <MedicationHistory patientCode={patientCode} />}
        {showPhAssistPlan && <Phassistplan patientCode={patientCode} />}
        {showPatientOutcome && <Patientoutcome patientCode={patientCode} />}
        {showCostSection && <Costsection patientCode={patientCode} />}
      </div>
      <h2 className="text-gray-400 font-bold text-2xl text-center -mt-4">  © Copyright Reserved 2017 E.C. &nbsp;&nbsp;&nbsp; Powered by Eskinder Ayalew Sisay</h2>
    </div>
  );
};

export default Home;
