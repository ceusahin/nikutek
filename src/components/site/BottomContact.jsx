import CompanyInfo from "./CompanyInfo";
import ContactForm from "./ContactForm";
import FadeContent from "../../utils/FadeContent";

function BottomContact() {
  return (
    <FadeContent
      blur={false}
      duration={1000}
      easing="ease-out"
      initialOpacity={0}
    >
      <div
        className="flex flex-col lg:flex-row justify-between items-center 
                   mt-16 sm:mt-20 px-4 sm:px-10 md:px-20 lg:px-32 xl:px-40 
                   pb-10 border-t border-gray-200 gap-10 lg:gap-0"
      >
        {/* Form */}
        <div className="w-full lg:w-1/2">
          <ContactForm />
        </div>

        {/* Bilgi */}
        <div className="w-full lg:w-1/2">
          <CompanyInfo />
        </div>
      </div>
    </FadeContent>
  );
}

export default BottomContact;
