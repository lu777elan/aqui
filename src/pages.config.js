/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Browser from './pages/Browser';
import Calendar from './pages/Calendar';
import Diary from './pages/Diary';
import Downloads from './pages/Downloads';
import Files from './pages/Files';
import GameChess from './pages/GameChess';
import GameColoring from './pages/GameColoring';
import GameStop from './pages/GameStop';
import GameWords from './pages/GameWords';
import Games from './pages/Games';
import Home from './pages/Home';
import Library from './pages/Library';
import OurSofa from './pages/OurSofa';
import Recipes from './pages/Recipes';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Browser": Browser,
    "Calendar": Calendar,
    "Diary": Diary,
    "Downloads": Downloads,
    "Files": Files,
    "GameChess": GameChess,
    "GameColoring": GameColoring,
    "GameStop": GameStop,
    "GameWords": GameWords,
    "Games": Games,
    "Home": Home,
    "Library": Library,
    "OurSofa": OurSofa,
    "Recipes": Recipes,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};