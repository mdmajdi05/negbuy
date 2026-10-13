// Real turbine / plant / workshop photography from Wikimedia Commons (free license).
import { writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "oem");
const T = (p) => "https://thumb.wikimedia.org/wikipedia/commons/thumb/" + p;
const U = (p) => "https://upload.wikimedia.org/wikipedia/commons/" + p;

const MAP = {
  "wm-plant-hybrid.jpg": T("6/6e/Hybrid_Power_Plant_in_Laghouat_Province%2C_Algeria.jpg/1920px-Hybrid_Power_Plant_in_Laghouat_Province%2C_Algeria.jpg"),
  "wm-gt-engine.jpg": T("0/07/Indirectly_fired_gas_turbine_engine.jpg/1920px-Indirectly_fired_gas_turbine_engine.jpg"),
  "wm-gt-4.jpg": U("3/3d/Gas_Turbine_4.jpg"),
  "wm-turbine-generator.jpg": T("5/5d/Waste_block_turbine_and_generator_in_Iru_Thermal_Power_Plant.jpg/1920px-Waste_block_turbine_and_generator_in_Iru_Thermal_Power_Plant.jpg"),
  "wm-rotor-lp.jpg": T("c/c3/Hamaoka_Nuclear_Exhibition_Center_Shin-Nagoya_Thermal_Power_Station_Unit-3_low_pressure_steam_turbine_rotor_2.jpg/1920px-Hamaoka_Nuclear_Exhibition_Center_Shin-Nagoya_Thermal_Power_Station_Unit-3_low_pressure_steam_turbine_rotor_2.jpg"),
  "wm-rotor-sotavento.jpg": T("6/6f/2018._Sotavento._Steam_turbine_rotor._Galiza-2.jpg/1920px-2018._Sotavento._Steam_turbine_rotor._Galiza-2.jpg"),
  "wm-rotor-1970.jpg": T("b/ba/Steam_turbine_rotor_1970.jpg/1920px-Steam_turbine_rotor_1970.jpg"),
  "wm-hall-bankside.jpg": T("6/68/Turbine_Hall_Bankside.JPG/1920px-Turbine_Hall_Bankside.JPG"),
  "wm-hall-ferrybridge.jpg": T("e/ec/The_old_Turbine_Hall_Ferrybridge_-_geograph.org.uk_-_3305892.jpg/1920px-The_old_Turbine_Hall_Ferrybridge_-_geograph.org.uk_-_3305892.jpg"),
  "wm-hall-battersea.jpg": U("9/96/Battersea_Power_Station_Turbine_Hall_A_2024-09-19.jpg"),
  "wm-blades-vanes.jpg": T("c/c0/Axial_compressor_blades_and_vanes.JPG/1920px-Axial_compressor_blades_and_vanes.JPG"),
  "wm-factory-mapna-05.jpg": T("e/ea/MAPNA_Group%2C_Fardis%2C_Alborz_Province%2C_Iran_%282025%29_05.jpg/1920px-MAPNA_Group%2C_Fardis%2C_Alborz_Province%2C_Iran_%282025%29_05.jpg"),
  "wm-factory-mapna-12.jpg": T("b/bf/MAPNA_Group%2C_Fardis%2C_Alborz_Province%2C_Iran_%282025%29_12.jpg/1920px-MAPNA_Group%2C_Fardis%2C_Alborz_Province%2C_Iran_%282025%29_12.jpg"),
  "wm-stator-blade.jpg": T("2/2a/Stator_Blade_with_Thermal_Barrier_Testing_on_Hot_Gas_Rig_%28GRC-1975-C-01372%29.jpg/1920px-Stator_Blade_with_Thermal_Barrier_Testing_on_Hot_Gas_Rig_%28GRC-1975-C-01372%29.jpg"),
  "wm-control-altbach.jpg": T("7/72/Altbach_Power_Plant_Control_Room.JPG/1920px-Altbach_Power_Plant_Control_Room.JPG"),
  "wm-control-room.jpg": T("a/ac/Power_plant_control_room.jpg/1920px-Power_plant_control_room.jpg"),
  "wm-control-nuclear.jpg": T("0/05/Nuclear_power_plant_control_room_%2815856397259%29.jpg/1920px-Nuclear_power_plant_control_room_%2815856397259%29.jpg"),
  "wm-weld-shop.jpg": T("4/40/A_metal_welding_and_bending_shop.jpg/1920px-A_metal_welding_and_bending_shop.jpg"),
  "wm-weld-sparks.jpg": T("f/f7/Making_sparks_for_parts_%288625882%29.jpg/1920px-Making_sparks_for_parts_%288625882%29.jpg"),
  "wm-cut-metal.jpg": T("c/cc/Damage_Controlman_2nd_Class_Kirstin_Kulus%2C_from_Wendell_Arizona%2C_uses_a_portable_exothermal_cutting_unit_to_cut_metal_in_the_general_workshop_aboard_the_USS_Stout_%28DDG-55%29.jpg/1920px-thumbnail.jpg"),
  "wm-test-cell.jpg": T("b/ba/Engine_test_cell_structure_at_New_Jersey_Air_National_Guard_Base_170131-Z-YH452-020.jpg/1920px-Engine_test_cell_structure_at_New_Jersey_Air_National_Guard_Base_170131-Z-YH452-020.jpg"),
  "wm-ge-turboshaft.jpg": T("7/7c/General_Electric_XT700-GE-700_Turboshaft_Engine_-_DPLA_-_36818a2b62bf8af83acbaef7f15ef957_%28page_2%29.jpg/1920px-General_Electric_XT700-GE-700_Turboshaft_Engine_-_DPLA_-_36818a2b62bf8af83acbaef7f15ef957_%28page_2%29.jpg"),
  "wm-nacelle-unload.jpg": T("c/ce/Wind_tower_nacelle_being_unloaded.jpg/1920px-Wind_tower_nacelle_being_unloaded.jpg"),
  "wm-nacelle-crane.jpg": T("c/c2/Wind_turbine_construction%2C_Pougny%2C_E6-09%2C_nacelle_and_crane.jpg/1920px-Wind_turbine_construction%2C_Pougny%2C_E6-09%2C_nacelle_and_crane.jpg"),
  "wm-nacelle-01.jpg": T("4/46/Nacelle_of_Wind_Turbine_01.jpg/1920px-Nacelle_of_Wind_Turbine_01.jpg"),
  "wm-blading-works.jpg": U("1/12/The_Steam_Turbine%2C_1911_-_Fig_20_-_Blading_a_Turbine_at_the_Turbinia_Works.jpg"),
};

const ok = [], fail = [];
for (const [local, url] of Object.entries(MAP)) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "NEGBUY-site/1.0 (contact@negbuy.com)" } });
    if (!res.ok) { fail.push([local, res.status]); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4000) { fail.push([local, "tiny"]); continue; }
    await writeFile(join(OUT, local), buf);
    ok.push([local, (buf.length / 1024).toFixed(0) + "kb"]);
  } catch (e) { fail.push([local, e.message]); }
}
console.log("OK", ok.length, "FAIL", fail.length, JSON.stringify(fail));
console.log(JSON.stringify(ok));
