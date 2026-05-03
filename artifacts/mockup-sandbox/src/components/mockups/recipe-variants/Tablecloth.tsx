import React, { useEffect } from "react";
import { Search, Menu, Clock, ChefHat, Heart } from "lucide-react";

export function Tablecloth() {
  return (
    <div className="tablecloth-wrapper min-h-screen relative p-4 md:p-8 text-slate-800 selection:bg-yellow-200">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Patrick+Hand&display=swap');

        .tablecloth-wrapper {
          background-color: #F5F0E8;
          background-image: 
            radial-gradient(#d4caba 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 200, 200, 0.05) 1px, transparent 1px),
            linear-gradient(rgba(200, 200, 200, 0.05) 1px, transparent 1px);
          background-size: 20px 20px, 40px 40px, 40px 40px;
          font-family: 'Patrick Hand', cursive;
        }

        .sketch-font {
          font-family: 'Caveat', cursive;
        }

        .sketch-border {
          border: 2px solid #1e293b;
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
          box-shadow: 2px 3px 0px rgba(0,0,0,0.8);
        }

        .sketch-border-subtle {
          border: 1px solid #334155;
          border-radius: 20px 255px 15px 225px/225px 15px 255px 20px;
        }

        .sketch-underline {
          position: relative;
          display: inline-block;
        }
        
        .sketch-underline::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 3px;
          bottom: -2px;
          left: 0;
          background-color: #1e293b;
          border-radius: 4px;
          transform: rotate(-1deg);
        }

        .sticky-note {
          background-color: #fef08a;
          box-shadow: 3px 4px 6px rgba(0,0,0,0.1), 1px 1px 2px rgba(0,0,0,0.2) inset;
          border-radius: 2px 15px 4px 20px/20px 3px 25px 2px;
          transform: rotate(2deg);
        }

        .sketch-pill {
          border: 1.5px solid #1e293b;
          border-radius: 20px 15px 25px 10px / 10px 25px 15px 20px;
          padding: 0.25rem 0.75rem;
          display: inline-block;
        }

        .marker-red {
          color: #ef4444;
        }

        .list-x {
          list-style: none;
          padding-left: 1.5rem;
        }
        
        .list-x li {
          position: relative;
          margin-bottom: 0.5rem;
        }
        
        .list-x li::before {
          content: 'x';
          position: absolute;
          left: -1.5rem;
          font-family: 'Caveat', cursive;
          font-weight: bold;
          font-size: 1.2rem;
          color: #1e293b;
          top: -0.2rem;
        }

        .number-scrawl {
          font-family: 'Caveat', cursive;
          font-size: 1.8rem;
          font-weight: bold;
          line-height: 1;
          color: #ef4444;
          width: 2rem;
          display: inline-block;
        }
      `}} />

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Nav */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sketch-border flex items-center justify-center bg-white rotate-[-3deg]">
              <ChefHat size={24} strokeWidth={1.5} />
            </div>
            <h1 className="sketch-font text-4xl font-bold tracking-tight">My Recipe Box</h1>
          </div>
          
          <nav className="flex items-center gap-6 text-xl">
            <a href="#" className="sketch-underline font-bold">Recipes</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Reference</a>
            <a href="#" className="sketch-border px-4 py-1 bg-white hover:bg-slate-50 transition-colors rotate-1">
              + Add Recipe
            </a>
          </nav>
        </header>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <div className="sketch-border bg-white px-4 py-3 flex items-center gap-3 rotate-[-1deg]">
            <Search size={20} className="text-slate-500" strokeWidth={2} />
            <input 
              type="text" 
              placeholder="Search my scrawls..." 
              className="bg-transparent border-none outline-none w-full text-xl placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Recipe Detail Content */}
        <main className="grid md:grid-cols-[2fr_1fr] gap-8 items-start">
          
          {/* Main Recipe Area */}
          <article className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="sketch-pill bg-white text-lg font-bold">Italian</span>
                <span className="sketch-pill bg-white text-lg">Dinner</span>
                <span className="sketch-font text-2xl text-slate-500 flex items-center gap-2">
                  <Clock size={20} /> 45 mins
                </span>
              </div>
              
              <h2 className="sketch-font text-6xl md:text-7xl font-bold leading-tight marker-red">
                Grandma's Tomato Sauce
              </h2>
              <p className="text-2xl text-slate-700 sketch-font">
                The real deal. Don't rush the simmering!
              </p>
            </div>

            <div className="sketch-border-subtle bg-white p-6 md:p-8 space-y-8 rotate-[1deg]">
              <section>
                <h3 className="sketch-font text-4xl font-bold mb-4 sketch-underline inline-block">
                  Ingredients
                </h3>
                <ul className="list-x text-xl space-y-3 mt-4">
                  <li>2 cans (28oz) whole peeled San Marzano tomatoes</li>
                  <li>1/4 cup good olive oil</li>
                  <li>7 cloves garlic, smashed (not minced!)</li>
                  <li>1 large yellow onion, halved</li>
                  <li>Handful of fresh basil leaves</li>
                  <li>1 tsp kosher salt</li>
                  <li>Lots of fresh cracked black pepper</li>
                  <li>Pinch of red pepper flakes (optional but good)</li>
                </ul>
              </section>

              <section>
                <h3 className="sketch-font text-4xl font-bold mb-6 sketch-underline inline-block">
                  How to make it
                </h3>
                <div className="space-y-6 text-xl">
                  <div className="flex gap-4 items-start">
                    <span className="number-scrawl">1.</span>
                    <p>Pour the olive oil into a large heavy-bottomed pot or Dutch oven over medium heat.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="number-scrawl">2.</span>
                    <p>Toss in the smashed garlic. Let it sizzle until it's golden and fragrant, about 2-3 minutes. Don't burn it!</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="number-scrawl">3.</span>
                    <p>Carefully pour in the tomatoes (crush them with your hands as you add them - messy but necessary). Add the onion halves.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="number-scrawl">4.</span>
                    <p>Add salt, pepper, and red pepper flakes. Bring to a gentle bubble, then turn heat down to low.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="number-scrawl">5.</span>
                    <p>Simmer uncovered for at least 45 minutes. Stir occasionally so it doesn't stick.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="number-scrawl">6.</span>
                    <p>Turn off heat. Remove the onion halves. Stir in the fresh basil. Taste and adjust salt if needed.</p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          {/* Sidebar / Notes */}
          <aside className="space-y-8">
            <div className="sticky-note p-6 space-y-4">
              <h3 className="sketch-font text-3xl font-bold flex items-center gap-2">
                <Heart size={24} className="marker-red" fill="#ef4444" />
                Chef's Notes
              </h3>
              <p className="text-xl leading-relaxed">
                If the tomatoes taste a bit too acidic, add a tiny pinch of sugar or half a grated carrot while it simmers. 
              </p>
              <p className="text-xl leading-relaxed">
                Freezes beautifully! Double the batch.
              </p>
            </div>

            <div className="sketch-border bg-white p-6 rotate-[-2deg]">
              <h3 className="sketch-font text-3xl font-bold mb-4">Pairs well with:</h3>
              <ul className="text-xl space-y-2">
                <li>- Crusty garlic bread</li>
                <li>- Any pasta shape</li>
                <li>- Meatballs</li>
                <li>- Chicken Parm</li>
              </ul>
            </div>
          </aside>

        </main>
      </div>
    </div>
  );
}
