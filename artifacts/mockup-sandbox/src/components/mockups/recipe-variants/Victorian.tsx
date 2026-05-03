import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Victorian() {
  return (
    <div
      className="min-h-screen bg-[#1B3A2B] text-[#2C1810] font-serif overflow-x-hidden"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        backgroundImage: "radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');
          
          .font-heading {
            font-family: 'Playfair Display', serif;
          }
          
          .victorian-border {
            border: 4px double #2C1810;
            padding: 4px;
            background-color: #FDFBF7;
            position: relative;
          }
          
          .victorian-border::before {
            content: "";
            position: absolute;
            inset: 2px;
            border: 1px solid #2C1810;
            pointer-events: none;
          }

          .ornamental-divider {
            text-align: center;
            margin: 1.5rem 0;
            color: #2C1810;
            font-size: 1.2rem;
            letter-spacing: 0.2em;
          }
          
          .wax-seal {
            background-color: #722F37; /* Claret/Burgundy */
            color: #FDFBF7;
            border-radius: 50%;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 0.6rem;
            line-height: 1.1;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3);
            border: 2px solid #5a232b;
            transform: rotate(-10deg);
            position: absolute;
            top: -30px;
            right: -20px;
            z-index: 10;
            font-weight: bold;
            font-family: 'Playfair Display', serif;
          }
          
          .label-text {
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 0.75rem;
            font-weight: 700;
          }
          
          .drop-cap::first-letter {
            font-size: 3.5rem;
            float: left;
            margin-top: 0.15em;
            margin-right: 0.1em;
            line-height: 0.8;
            font-family: 'Playfair Display', serif;
            font-weight: 900;
            color: #722F37;
          }
        `}
      </style>

      {/* Header - Shop Sign */}
      <header className="bg-[#2C1810] text-[#E8DCC4] py-6 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-b-[8px] border-[#150b07] relative z-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-heading text-3xl md:text-4xl tracking-wider text-[#D4AF37] drop-shadow-md">
              SPENCER'S
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase opacity-80 mt-1">
              Provisions &amp; Recipe Emporium
            </p>
            <p className="text-[10px] italic opacity-60 mt-1 font-sans">
              EST. 1884
            </p>
          </div>
          <nav className="flex items-center gap-6 text-sm tracking-widest uppercase font-heading font-bold border-t border-b border-[#E8DCC4]/30 py-2 md:border-none md:py-0">
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Stock</a>
            <span className="text-[#D4AF37] opacity-50">✦</span>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Reference</a>
            <span className="text-[#D4AF37] opacity-50">✦</span>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Add to Ledger</a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="victorian-border shadow-2xl p-8 md:p-12 mt-8">
          
          {/* Wax Seal Badge */}
          <div className="wax-seal">
            Sauces<br/>&amp;<br/>Preserves
          </div>

          {/* Title Area (Like a Tin Label) */}
          <div className="border-[3px] border-[#2C1810] p-6 text-center relative bg-[#FFF9EB]">
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-[#2C1810] pointer-events-none"></div>
            
            <p className="label-text mb-4 text-[#722F37]">Fine Culinary Receipts</p>
            
            <h2 className="font-heading text-4xl md:text-6xl font-black mb-2 text-[#2C1810] leading-tight">
              Mrs. Thornton's
            </h2>
            <h3 className="font-heading text-2xl md:text-3xl italic mb-6 text-[#2C1810]">
              Preserved Tomato Sauce
            </h3>
            
            <div className="flex justify-center items-center gap-4 mb-4">
              <span className="w-12 h-[1px] bg-[#2C1810]"></span>
              <span className="text-xl">❧</span>
              <span className="w-12 h-[1px] bg-[#2C1810]"></span>
            </div>
            
            <div className="flex justify-center gap-8 label-text border-t border-b border-[#2C1810] py-2 mx-auto max-w-md">
              <div>
                <span className="opacity-70 block text-[10px]">Yield</span>
                4 Pints
              </div>
              <div className="w-[1px] bg-[#2C1810]"></div>
              <div>
                <span className="opacity-70 block text-[10px]">Time Required</span>
                2 Hours
              </div>
              <div className="w-[1px] bg-[#2C1810]"></div>
              <div>
                <span className="opacity-70 block text-[10px]">Cost</span>
                1s 6d
              </div>
            </div>
          </div>

          <div className="ornamental-divider">
            ✦ ═══ ❧ ═══ ✦
          </div>

          <div className="grid md:grid-cols-12 gap-10 mt-8">
            
            {/* Ingredients (Druggist style) */}
            <div className="md:col-span-5">
              <div className="bg-[#F4ECD8] p-6 border-l-4 border-[#722F37] shadow-inner h-full">
                <h4 className="font-heading text-2xl mb-6 text-center border-b-2 border-[#2C1810] pb-2 uppercase tracking-widest">
                  The Manifest
                </h4>
                
                <ul className="space-y-4 text-lg">
                  <li className="flex justify-between items-baseline">
                    <span className="italic">Ripe, unblemished tomatoes</span>
                    <span className="border-b border-dotted border-[#2C1810] flex-grow mx-2 opacity-50"></span>
                    <span className="font-bold">1 peck</span>
                  </li>
                  <li className="flex justify-between items-baseline">
                    <span className="italic">Spanish onions, finely minced</span>
                    <span className="border-b border-dotted border-[#2C1810] flex-grow mx-2 opacity-50"></span>
                    <span className="font-bold">6 large</span>
                  </li>
                  <li className="flex justify-between items-baseline">
                    <span className="italic">Garlick cloves</span>
                    <span className="border-b border-dotted border-[#2C1810] flex-grow mx-2 opacity-50"></span>
                    <span className="font-bold">1/2 ounce</span>
                  </li>
                  <li className="flex justify-between items-baseline">
                    <span className="italic">Best white vinegar</span>
                    <span className="border-b border-dotted border-[#2C1810] flex-grow mx-2 opacity-50"></span>
                    <span className="font-bold">1 pint</span>
                  </li>
                  <li className="flex justify-between items-baseline">
                    <span className="italic">Coarse sea salt</span>
                    <span className="border-b border-dotted border-[#2C1810] flex-grow mx-2 opacity-50"></span>
                    <span className="font-bold">1 teacup</span>
                  </li>
                  <li className="flex justify-between items-baseline">
                    <span className="italic">Black peppercorns, whole</span>
                    <span className="border-b border-dotted border-[#2C1810] flex-grow mx-2 opacity-50"></span>
                    <span className="font-bold">1 ounce</span>
                  </li>
                  <li className="flex justify-between items-baseline">
                    <span className="italic">Cloves & Allspice</span>
                    <span className="border-b border-dotted border-[#2C1810] flex-grow mx-2 opacity-50"></span>
                    <span className="font-bold">1/2 oz. each</span>
                  </li>
                </ul>

                <div className="mt-8 pt-4 border-t border-[#2C1810] text-center">
                  <img 
                    src="/__mockup/images/vintage-tomatoes.png" 
                    alt="Vintage tomato illustration" 
                    className="w-32 h-32 mx-auto rounded-full object-cover border-[3px] border-[#2C1810] sepia-[0.3]"
                  />
                  <p className="mt-2 text-xs italic opacity-70">
                    Fig 1. Solanum lycopersicum
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="md:col-span-7">
              <h4 className="font-heading text-3xl mb-6 text-center text-[#722F37]">
                Method of Preparation
              </h4>
              
              <div className="space-y-6 text-lg leading-relaxed text-justify">
                <p className="drop-cap">
                  Procure the finest specimens of vine-ripened tomatoes, ensuring they are entirely free from blemish or decay. Scald them briefly in boiling water to facilitate the removal of their skins, then divide them into quarters.
                </p>
                
                <p>
                  Place the prepared fruit into a capacious brass or enameled preserving pan. Add the minced onions and garlick, setting the vessel over a gentle heat. Allow the mixture to simmer steadily until the whole is reduced to a soft pulp, which generally occupies the space of an hour.
                </p>
                
                <p>
                  At this juncture, pass the entire substance through a fine hair-sieve, pressing diligently with a wooden spoon to extract all available virtue from the pulp, while retaining the seeds and fibrous matters.
                </p>
                
                <p>
                  Return the sieved liquor to the cleansed pan. Incorporate the vinegar, salt, and spices (the latter having been securely tied within a small muslin bag). Resume the boiling, skimming carefully should any scum rise to the surface, until the sauce acquires a rich, thick consistence.
                </p>

                <p>
                  Remove the spice bag. Decant the boiling liquid into dry, heated glass bottles. Cork securely whilst hot, and seal the corks with bottling wax to entirely exclude the air. Store in a cool, dark cellar.
                </p>
              </div>

              {/* Proprietor's Notes */}
              <div className="mt-10 p-5 bg-[#E8DCC4] border border-[#2C1810] shadow-[4px_4px_0_#2C1810] rotate-1">
                <h5 className="font-heading text-lg font-bold mb-2 border-b border-[#2C1810] inline-block pb-1">
                  Proprietor's Note:
                </h5>
                <p className="font-[cursive] text-xl leading-relaxed opacity-80 text-[#1a0f0a]">
                  This receipt has proven most efficacious for accompanying cold meats during the winter months. It keeps admirably for upwards of a year if the seals remain unbroken.
                </p>
                <div className="text-right mt-2 font-heading font-bold text-sm">
                  — J. Spencer, Esq.
                </div>
              </div>
              
            </div>
          </div>
          
          <div className="ornamental-divider mt-12 mb-4">
            ─── ✦ ❧ ✦ ───
          </div>
          
          <div className="text-center text-sm uppercase tracking-widest font-heading opacity-60">
            Entered at Stationers' Hall.
          </div>

        </div>
      </main>
    </div>
  );
}
