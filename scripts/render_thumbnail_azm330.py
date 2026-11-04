# Thumbnail of AZM330 in the isometric.jpg style (flat colors with edges), same pose as bake_azm330.py, from the side.
# Two steps, from the repo root. The FreeCAD document is never saved.
#   systemd-run --user --collect /snap/bin/freecad <cad>/DemolitionRobot.FCStd $PWD/scripts/render_thumbnail_azm330.py
#   python3 scripts/render_thumbnail_azm330.py --finish      (white thumbnail.jpg, needs Pillow)
import sys
if "--finish" in sys.argv:
    from PIL import Image
    W, H, PAD = 1800, 1100, 40
    im = Image.open(".cache/thumbnail_raw.png").convert("RGBA")
    r = im.crop(im.split()[3].getbbox())
    s = min((W - 2 * PAD) / r.width, (H - 2 * PAD) / r.height)
    r = r.resize((round(r.width * s), round(r.height * s)), Image.LANCZOS)
    out = Image.new("RGB", (W, H), "white")
    out.paste(r, ((W - r.width) // 2, (H - r.height) // 2), r)
    out.save("public/assets/img/projects/work/demolition_sim/thumbnail.jpg", quality=88, optimize=True)
    sys.exit()

import os, re, traceback
import FreeCAD as App
import FreeCADGui as Gui

ROOT = "/home/achadansori/achadansori/achadansori.github.io/"
CAD = "/home/achadansori/achadansori/aldzama/demolition_robot_development/cad/"
os.makedirs(ROOT + ".cache", exist_ok=True)
LOG = open(ROOT + ".cache/render_thumbnail.log", "w")
src = open(ROOT + "scripts/bake_azm330.py").read()
POSE = eval(re.search(r"^POSE = (\{.*\})", src, re.M).group(1))
GROUPS = eval(re.search(r"^GROUPS = (\(.*\))", src, re.M).group(1))
YELLOW, DARK, TRACK = (0.97, 0.71, 0.04), (0.16, 0.16, 0.18), (0.20, 0.20, 0.22)
LIGHT, WHITE, HOSE = (0.62, 0.63, 0.66), (0.90, 0.91, 0.93), (0.05, 0.05, 0.06)
BODY = ("Boom_D", "Arm_D", "Arm3_D", "Rocker", "Link_D", "TurretFrame", "Counterweight", "Cover", "ChassisFrame", "OutrigLeg", "OutrigPad", "Pipes_")
VIEW_FROM = App.Vector(0.30, -1.0, 0.14)    # right side, slightly from the front and above; same as the 3D viewer


def color_of(n):
    if n.startswith(("Breaker_D", "ToolBracket_D", "Hw_ToolBracket")) or "Barrel" in n:
        return DARK
    if n.startswith(BODY):
        return YELLOW
    if "Belt" in n or n.startswith(("TrackL_", "TrackR_")):
        return TRACK
    if n.startswith("Hose"):
        return HOSE
    if n.endswith(("_Rod", "_Rod001")) or n.startswith(("Pin_", "Bush_")):
        return WHITE
    return LIGHT


try:
    from PySide import QtGui
    pump = lambda: [QtGui.QApplication.processEvents() for _ in range(20)]
    doc = App.getDocument("DemolitionRobot")
    gd = Gui.getDocument(doc.Name)
    for dck in Gui.getMainWindow().findChildren(QtGui.QDockWidget):
        if dck.objectName() == "ArmJoystickDock" and hasattr(dck, "timer"):
            dck.timer.stop()
    sh = doc.Params
    for alias, deg in POSE.items():
        sh.set(sh.getCellFromAlias(alias), f"={deg} deg")
    doc.recompute()
    arm = {"__name__": "lib"}
    exec(open(CAD + "build_arm_detail_assy.py").read(), arm)
    arm["rebuild_hoses"](False)
    doc.recompute()
    for g in GROUPS:
        gd.getObject(g).Visibility = True
    for o in doc.Objects:
        vo = gd.getObject(o.Name)
        if vo is None or o.TypeId == "App::DocumentObjectGroup":
            continue
        vo.Visibility = (o.InList[0].Name if o.InList else "") in GROUPS
        if vo.Visibility and hasattr(vo, "ShapeColor"):
            c = color_of(o.Name)
            try:
                vo.ShapeColor = c
                vo.DiffuseColor = [c]
            except Exception:
                pass
            if hasattr(vo, "LineColor"):
                vo.LineColor = (0.12, 0.10, 0.06)
            if o.Name == "Cover" and hasattr(vo, "Transparency"):
                vo.Transparency = 0
    v = gd.ActiveView
    z = App.Vector(VIEW_FROM); z.normalize()
    x = App.Vector(0, 0, 1).cross(z); x.normalize()
    y = z.cross(x)
    pump()
    v.setCameraType("Orthographic")
    v.setCameraOrientation(App.Rotation(x, y, z, "ZYX").Q)
    pump(); v.fitAll(); pump()
    v.saveImage(ROOT + ".cache/thumbnail_raw.png", 4200, 2800, "Transparent")
    LOG.write("OK\n")
except Exception:
    LOG.write(traceback.format_exc())
finally:
    LOG.write("SELESAI\n"); LOG.close(); os._exit(0)
