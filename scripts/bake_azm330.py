# Bake the AZM330 FreeCAD model in a chosen pose to public/assets/models/azm330.glb (one mesh per color, Z-up, mm).
#   snap run freecad.cmd scripts/bake_azm330.py        (from the repo root)
# The FCStd is opened but never saved. Cylinders follow Params; arm hoses are rebuilt for the pose.
import json, os, pathlib, struct, traceback
import FreeCAD as App
import MeshPart

CAD = os.environ.get("AZM330_CAD", "/home/achadansori/achadansori/aldzama/demolition_robot_development/cad/")
ROOT = pathlib.Path.cwd()
OUT = ROOT / "public/assets/models/azm330.glb"
(ROOT / ".cache").mkdir(exist_ok=True)
LOG = open(ROOT / ".cache/bake_azm330.log", "w")
# Tessellation (linear mm, angular rad) per color: smaller = smoother and bigger file. Hoses are thin and many.
DETAIL = {"hose": (25.0, 1.3), "chrome": (6.0, 0.9), "light": (6.0, 0.8)}
DEFAULT_DETAIL = (5.0, 0.6)

# Degrees, same pose as the CAN monitor preview: boom up, third arm and breaker hanging down.
POSE = {"PoseBoom": 96, "PoseArm": -70, "PoseArm3": -100, "PoseTool": -46, "SlewAngle": 0, "MachineYaw": 0}
GROUPS = ("Undercarriage", "Turret", "ArmDetailAssy", "Cameras")
BODY = ("Boom_D", "Arm_D", "Arm3_D", "Rocker", "Link_D", "TurretFrame", "Counterweight", "Cover", "ChassisFrame",
        "OutrigLeg", "OutrigPad", "Pipes_")
COLORS = {"yellow": (0.97, 0.71, 0.04), "dark": (0.16, 0.16, 0.18), "track": (0.20, 0.20, 0.22),
          "light": (0.62, 0.63, 0.66), "chrome": (0.90, 0.91, 0.93), "hose": (0.05, 0.05, 0.06)}


def color_of(n):
    # Same rules as video_web/render_iso_azm.py, so it matches isometric.jpg.
    if n.startswith(("Breaker_D", "ToolBracket_D", "Hw_ToolBracket")) or "Barrel" in n:
        return "dark"
    if n.startswith(BODY):
        return "yellow"
    if "Belt" in n or n.startswith(("TrackL_", "TrackR_")):
        return "track"
    if n.startswith("Hose"):
        return "hose"
    if n.endswith(("_Rod", "_Rod001")) or n.startswith(("Pin_", "Bush_")):
        return "chrome"
    return "light"


def write_glb(groups, path):
    bin_, views, accessors, meshes, materials, nodes = bytearray(), [], [], [], [], []
    for i, (name, (verts, tris)) in enumerate(sorted(groups.items())):
        vb = struct.pack(f"<{len(verts) * 3}f", *[c for v in verts for c in v])
        ib = struct.pack(f"<{len(tris)}I", *tris)
        views += [{"buffer": 0, "byteOffset": len(bin_), "byteLength": len(vb), "target": 34962},
                  {"buffer": 0, "byteOffset": len(bin_) + len(vb), "byteLength": len(ib), "target": 34963}]
        bin_ += vb + ib
        accessors += [{"bufferView": 2 * i, "componentType": 5126, "count": len(verts), "type": "VEC3",
                       "min": [min(v[k] for v in verts) for k in range(3)],
                       "max": [max(v[k] for v in verts) for k in range(3)]},
                      {"bufferView": 2 * i + 1, "componentType": 5125, "count": len(tris), "type": "SCALAR"}]
        materials.append({"name": name, "pbrMetallicRoughness": {"baseColorFactor": [*COLORS[name], 1]}})
        meshes.append({"name": name, "primitives": [{"attributes": {"POSITION": 2 * i}, "indices": 2 * i + 1, "material": i}]})
        nodes.append({"mesh": i, "name": name})
    gltf = {"asset": {"version": "2.0", "generator": "bake_azm330.py"}, "scene": 0,
            "scenes": [{"nodes": list(range(len(nodes)))}], "nodes": nodes, "meshes": meshes, "materials": materials,
            "accessors": accessors, "bufferViews": views, "buffers": [{"byteLength": len(bin_)}]}
    j = json.dumps(gltf, separators=(",", ":")).encode()
    j += b" " * (-len(j) % 4)
    bin_ += b"\0" * (-len(bin_) % 4)
    with open(path, "wb") as f:
        f.write(struct.pack("<3I", 0x46546C67, 2, 28 + len(j) + len(bin_)))
        f.write(struct.pack("<2I", len(j), 0x4E4F534A) + j)
        f.write(struct.pack("<2I", len(bin_), 0x004E4942) + bytes(bin_))


try:
    doc = App.openDocument(CAD + "DemolitionRobot.FCStd")
    sh = doc.Params
    for alias, deg in POSE.items():
        sh.set(sh.getCellFromAlias(alias), f"={deg} deg")
    doc.recompute()
    arm = {"__name__": "lib"}
    exec(open(CAD + "build_arm_detail_assy.py").read(), arm)
    arm["rebuild_hoses"](False)
    doc.recompute()
    for n in ("CylBoom", "CylArm", "CylArm3", "CylTool"):
        LOG.write(f"{n}: " + ", ".join(f"{a}={sh.get(a)}" for a in (n + "_Ext", n + "Ext", "Ext" + n) if sh.getCellFromAlias(a)) + "\n")

    groups, counts = {}, {}
    for o in doc.Objects:
        if not o.InList or o.InList[0].Name not in GROUPS or not hasattr(o, "Shape") or o.TypeId == "App::DocumentObjectGroup" or o.Shape.isNull():
            continue
        name = color_of(o.Name)
        linear, angular = DETAIL.get(name, DEFAULT_DETAIL)
        pts, faces = MeshPart.meshFromShape(Shape=o.Shape, LinearDeflection=linear, AngularDeflection=angular, Relative=False).Topology
        verts, tris = groups.setdefault(name, ([], []))
        off = len(verts)
        verts.extend((p.x, p.y, p.z) for p in pts)
        tris.extend(i + off for f in faces for i in f)
        counts[name] = counts.get(name, 0) + len(faces)
    write_glb(groups, OUT)
    allv = [v for vs, _ in groups.values() for v in vs]
    LOG.write(f"triangles {counts} total {sum(counts.values())}\n")
    LOG.write(f"bbox min {[round(min(v[k] for v in allv)) for k in range(3)]} max {[round(max(v[k] for v in allv)) for k in range(3)]}\n")
    LOG.write(f"glb {OUT.stat().st_size / 1e6:.1f} MB\n")
except Exception:
    LOG.write(traceback.format_exc())
finally:
    LOG.write("SELESAI\n")
    LOG.close()
    os._exit(0)
