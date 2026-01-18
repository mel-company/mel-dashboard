import { useServeJsonFile } from "@/api/wrappers/editor.wrappers";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

// Custom hook to detect window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowSize.width < 640; // sm breakpoint
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024; // md breakpoint
  const isDesktop = windowSize.width >= 1024; // lg breakpoint

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile,
    isTablet,
    isDesktop,
  };
};

type Props = {};

interface Section {
  id: string;
  type: string;
  position: number;
  settings: any;
  publishedContent: any;
  isGlobal: boolean;
  source: any;
}

interface CarouselSlide {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  backgroundImage: string;
  overlay: string;
  button?: {
    text: string;
    route: string;
    style: React.CSSProperties;
  };
  style: React.CSSProperties;
}

interface CarouselHeroContent {
  style: React.CSSProperties;
  slides: CarouselSlide[];
  enabled: boolean;
  carouselSettings: {
    dots: boolean;
    arrows: boolean;
    autoplay: boolean;
    infinite: boolean;
    transition: string;
    pauseOnHover: boolean;
    autoplaySpeed: number;
  };
}

interface ProductsGridContent {
  items: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;
  source: any;
  style: React.CSSProperties;
}

const CarouselHeroSection = ({ content }: { content: CarouselHeroContent; settings: any }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { slides, carouselSettings } = content;
  const { isMobile, isTablet } = useWindowSize();

  useEffect(() => {
    if (!carouselSettings.autoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (carouselSettings.infinite) {
          return (prev + 1) % slides.length;
        }
        return prev < slides.length - 1 ? prev + 1 : prev;
      });
    }, carouselSettings.autoplaySpeed);

    return () => clearInterval(interval);
  }, [carouselSettings.autoplay, carouselSettings.autoplaySpeed, carouselSettings.infinite, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (carouselSettings.infinite) {
        return (prev + 1) % slides.length;
      }
      return prev < slides.length - 1 ? prev + 1 : prev;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (carouselSettings.infinite) {
        return prev === 0 ? slides.length - 1 : prev - 1;
      }
      return prev > 0 ? prev - 1 : prev;
    });
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div
      style={{
        ...content.style,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: isMobile ? "300px" : isTablet ? "400px" : content.style.minHeight || "500px",
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${currentSlideData.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Overlay */}
        {currentSlideData.overlay && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: currentSlideData.overlay,
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: content.style.alignItems || "center",
            justifyContent: content.style.justifyContent || "center",
            textAlign: content.style.textAlign || "center",
            padding: isMobile ? "1rem" : isTablet ? "1.5rem" : content.style.padding || "2rem",
            color: currentSlideData.style.color || "#FFFFFF",
            textShadow: currentSlideData.style.textShadow || "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "1.75rem" : isTablet ? "2.25rem" : "3rem",
              fontWeight: "bold",
              marginBottom: isMobile ? "0.5rem" : "1rem",
              padding: isMobile ? "0 1rem" : "0",
              ...currentSlideData.style,
            }}
          >
            {currentSlideData.title}
          </h1>
          <p
            style={{
              fontSize: isMobile ? "0.875rem" : isTablet ? "1rem" : "1.25rem",
              marginBottom: isMobile ? "1rem" : "2rem",
              maxWidth: isMobile ? "100%" : isTablet ? "500px" : "600px",
              padding: isMobile ? "0 1rem" : "0",
            }}
          >
            {currentSlideData.subtitle}
          </p>
          {currentSlideData.button && (
            <button
              onClick={() => {
                // Handle navigation if needed
                console.log("Navigate to:", currentSlideData.button?.route);
              }}
              style={{
                ...currentSlideData.button.style,
                fontSize: isMobile ? "14px" : currentSlideData.button.style.fontSize || "18px",
                padding: isMobile ? "10px 24px" : currentSlideData.button.style.padding || "14px 32px",
                cursor: "pointer",
                border: "none",
                outline: "none",
              }}
            >
              {currentSlideData.button.text}
            </button>
          )}
        </div>

        {/* Navigation Arrows */}
        {carouselSettings.arrows && slides.length > 1 && !isMobile && (
          <>
            <button
              onClick={prevSlide}
              style={{
                position: "absolute",
                left: isTablet ? "10px" : "20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                background: "rgba(255, 255, 255, 0.3)",
                border: "none",
                borderRadius: "50%",
                width: isTablet ? "36px" : "40px",
                height: isTablet ? "36px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              }}
            >
              <ChevronLeft size={isTablet ? 20 : 24} />
            </button>
            <button
              onClick={nextSlide}
              style={{
                position: "absolute",
                right: isTablet ? "10px" : "20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                background: "rgba(255, 255, 255, 0.3)",
                border: "none",
                borderRadius: "50%",
                width: isTablet ? "36px" : "40px",
                height: isTablet ? "36px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              }}
            >
              <ChevronRight size={isTablet ? 20 : 24} />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {carouselSettings.dots && slides.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              display: "flex",
              gap: "8px",
            }}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: currentSlide === index ? "24px" : "12px",
                  height: "12px",
                  borderRadius: "6px",
                  border: "none",
                  background: currentSlide === index ? "white" : "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// @ts-ignore
const ProductsGridSection = ({ content, settings, source }: { content: ProductsGridContent; settings: any; source: any }) => {
  const { items, style } = content;
  const { isMobile, isTablet, isDesktop } = useWindowSize();

  // Get responsive columns based on screen size
  let columns = 3; // default
  let rows = 2; // default
  
  if (settings) {
    if (isMobile && settings.sm) {
      columns = settings.sm.columns || 1;
      rows = settings.sm.rows || 2;
    } else if (isTablet && settings.md) {
      columns = settings.md.columns || 2;
      rows = settings.md.rows || 2;
    } else if (isDesktop && settings.lg) {
      columns = settings.lg.columns || 3;
      rows = settings.lg.rows || 2;
    } else {
      // Fallback to default settings
      columns = settings.columns || 3;
      rows = settings.rows || 2;
    }
  }

//   const {data: products} = useFetchProducts(source.url)

  // Convert kebab-case style properties to camelCase for React
  const styleObj = style as Record<string, any>;
  const paddingVertical = styleObj["padding-vertical"] || 0;
  const paddingHorizontal = styleObj["padding-horizontal"] || 0;
  const marginVertical = styleObj["margin-vertical"] || 0;
  const marginHorizontal = styleObj["margin-horizontal"] || 0;
  const backgroundColor = styleObj["background-color"] || "#fff";
  const textAlign = styleObj["text-align"] || "center";

  // Responsive padding and gap
  const responsivePadding = isMobile 
    ? `${Math.max(paddingVertical * 0.5, 8)}px ${Math.max(paddingHorizontal * 0.5, 16)}px`
    : isTablet
    ? `${Math.max(paddingVertical * 0.75, 12)}px ${Math.max(paddingHorizontal * 0.75, 24)}px`
    : `${paddingVertical}px ${paddingHorizontal}px`;
  
  const gap = isMobile ? "1rem" : isTablet ? "1.25rem" : "1.5rem";

  return (
    <div
      style={{
        padding: responsivePadding,
        margin: `${marginVertical}px ${marginHorizontal}px`,
        backgroundColor,
        textAlign: textAlign as React.CSSProperties["textAlign"],
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
          maxWidth: isMobile ? "100%" : isTablet ? "768px" : "1200px",
          margin: "0 auto",
          padding: isMobile ? "0 1rem" : "0",
        }}
      >
        {items.slice(0, columns * rows).map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">{item.order}</h3>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SectionRenderer = ({ section }: { section: Section }) => {
  const { type, publishedContent, settings, source } = section;

  console.log("SOURCE", section)

  switch (type) {
    case "carouselHero":
      return <CarouselHeroSection content={publishedContent as CarouselHeroContent} settings={settings} />;
    case "products_grid":
      return <ProductsGridSection content={publishedContent as ProductsGridContent} settings={settings} source={source} />;
    default:
      return (
        <Card className="p-4">
          <CardContent>
            <p className="text-muted-foreground">Unknown section type: {type}</p>
          </CardContent>
        </Card>
      );
  }
};

const Editor = ({}: Props) => {
  const { data: jsonFile, isLoading: isLoadingJsonFile } = useServeJsonFile();
  const { isMobile, isTablet } = useWindowSize();

  if (isLoadingJsonFile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المحتوى...</p>
        </div>
      </div>
    );
  }

  if (!jsonFile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <CardContent>
            <p className="text-muted-foreground">لا يوجد محتوى للعرض</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort sections by position
  const sortedSections = [...(jsonFile.sections || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className={`bg-card border-b ${isMobile ? "p-4" : isTablet ? "p-5" : "p-6"} mb-6`}>
        <h1 className={`${isMobile ? "text-xl" : isTablet ? "text-2xl" : "text-3xl"} font-bold mb-2`}>
          {jsonFile.title}
        </h1>
        <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
          Route: {jsonFile.route} | Locale: {jsonFile.locale}
        </p>
      </div>

      {/* Render Sections */}
      {sortedSections.map((section: Section) => (
        <div key={section.id} className="w-full">
          <SectionRenderer section={section} />
        </div>
      ))}
    </div>
  );
};

export default Editor;
